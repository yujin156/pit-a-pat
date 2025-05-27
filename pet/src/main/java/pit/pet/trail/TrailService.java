package pit.pet.trail;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import pit.pet.Account.Repository.DogRepository;
import pit.pet.Account.Repository.UserRepository;
import pit.pet.Account.User.Address;
import pit.pet.Account.User.Dog;
import pit.pet.Account.User.User;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrailService {

    private final TrailRepository trailRepo;
    private final ObjectMapper objectMapper;
    private final UserRepository userRepository;
    private final DogRepository dogRepository;
    @Value("${naver.client-id}")
    private String clientId;

    @Value("${naver.client-secret}")
    private String clientSecret;

    private final RestTemplate restTemplate = new RestTemplate();

    public List<TrailDto> getTrailsByIds(List<Long> ids) {
        List<Trail> trails = trailRepo.findByIdIn(ids);
        return trails.stream().map(this::convertToDto).toList();
    }

    public int fetchAndSaveFromKeyword(String keyword) {
        int count = 0;

        for (int start = 1; start <= 90; start += 30) {
            String url = UriComponentsBuilder
                    .fromHttpUrl("https://openapi.naver.com/v1/search/local.json")
                    .queryParam("query", keyword)
                    .queryParam("display", 30)
                    .queryParam("start", start)
                    .build()
                    .toUriString();

            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Naver-Client-Id", clientId);
            headers.set("X-Naver-Client-Secret", clientSecret);

            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<JsonNode> response = restTemplate.exchange(url, HttpMethod.GET, entity, JsonNode.class);
            JsonNode items = response.getBody().path("items");

            if (!items.isArray() || items.size() == 0) break;

            for (JsonNode item : items) {
                String name = item.path("title").asText().replaceAll("<[^>]*>", "");
                double lng = Double.parseDouble(item.path("mapx").asText()) / 10000000.0;
                double lat = Double.parseDouble(item.path("mapy").asText()) / 10000000.0;

                Trail trail = new Trail();
                trail.setName(name);
                trail.setLengthKm(2.0 + count * 0.1);
                trail.setDifficulty("EASY");
                trail.setSidoCode("11");
                trail.setSigunguCode("11230");
                trail.setEmdCode("11230640");

                try {
                    String pathJson = objectMapper.writeValueAsString(List.of(
                            new LatLngDto(lat, lng),
                            new LatLngDto(lat + 0.001, lng + 0.001)
                    ));
                    trail.setPathJson(pathJson);
                } catch (Exception e) {
                    continue;
                }

                trailRepo.save(trail);
                count++;
            }
        }

        return count;
    }


    private TrailDto convertToDto(Trail trail) {
        List<LatLngDto> path = new ArrayList<>();
        try {
            path = objectMapper.readValue(trail.getPathJson(), new TypeReference<>() {});
        } catch (Exception e) {
            e.printStackTrace();
        }

        String regionName = trail.getSidoCode() + " " + trail.getSigunguCode() + " " + trail.getEmdCode();

        TrailDto dto = new TrailDto();
        dto.setId(trail.getId());
        dto.setName(trail.getName());
        dto.setLengthKm(trail.getLengthKm());
        dto.setDifficulty(trail.getDifficulty());
        dto.setSidoCode(trail.getSidoCode());
        dto.setSigunguCode(trail.getSigunguCode());
        dto.setEmdCode(trail.getEmdCode());
        dto.setRegionName(regionName);
        dto.setPath(path);

        return dto;
    }

    public int fetchAndSaveFromKeywords(List<String> keywords) {
        int totalSaved = 0;

        for (String keyword : keywords) {
            totalSaved += fetchAndSaveFromKeyword(keyword);
        }

        return totalSaved;
    }
    public List<TrailDto> recommendByUser(Long userId, Long dogId, int limit) {
        int max = (limit == 0 ? 5 : limit);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다: " + userId));
        Address addr = user.getAddress();

        String sido = addr.getCity();
        String sigungu = addr.getCounty();
        String emd = addr.getTown();

        Dog dog = dogRepository.findById(dogId)
                .filter(d -> d.getOwner().getUno().equals(userId))
                .orElseThrow(() -> new IllegalArgumentException("해당 유저 소유 강아지 없음: " + dogId));
        double[] range = dog.getSize().recommendLengthRange();
        double minKm = range[0], maxKm = range[1];

        List<Trail> candidates = trailRepo.findAll().stream()
                .filter(t -> t.getSidoCode().equals(sido))
                .filter(t -> t.getSigunguCode().equals(sigungu))// 읍면동 기준까지 필터
                .filter(t -> t.getLengthKm() >= minKm && t.getLengthKm() <= maxKm)
                .collect(Collectors.toList());

        Collections.shuffle(candidates); // 랜덤 정렬
        return candidates.stream()
                .limit(max)
                .map(this::convertToDto)
                .toList();
    }

    public List<LatLngDto> fetchOrderedRoute(String trailName) throws Exception {
        // Overpass QL
        String query = """
        [out:json][timeout:25];
        relation["route"="hiking"]["name"="%s"];
        out body meta;
        (._; >;);
        out geom;
        """.formatted(trailName);

        // form-urlencoded 전송
        MultiValueMap<String,String> form = new LinkedMultiValueMap<>();
        form.add("data", query);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        HttpEntity<MultiValueMap<String,String>> req = new HttpEntity<>(form, headers);

        JsonNode root = restTemplate.postForObject(
                "https://overpass-api.de/api/interpreter", req, JsonNode.class);

        // 1) elements 배열 꺼내기 (여기서 NPE 방지)
        JsonNode elementsNode = root.get("elements");
        if (elementsNode == null || !elementsNode.isArray()) {
            throw new IllegalStateException("Overpass 반환에 elements가 없습니다.");
        }
        List<JsonNode> elements = new ArrayList<>();
        elementsNode.forEach(elements::add);

        // 2) relation element 찾기
        JsonNode relationElem = elements.stream()
                .filter(e -> "relation".equals(e.path("type").asText()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("relation이 응답에 없습니다."));

        // 3) member 순서대로 way ID 수집
        List<Long> wayOrder = new ArrayList<>();
        for (JsonNode m : relationElem.get("members")) {
            if ("way".equals(m.path("type").asText())) {
                wayOrder.add(m.path("ref").asLong());
            }
        }

        // 4) way → geometry 매핑
        Map<Long, List<LatLngDto>> wayGeom = new HashMap<>();
        for (JsonNode e : elements) {
            if ("way".equals(e.path("type").asText()) && e.has("geometry")) {
                long id = e.path("id").asLong();
                List<LatLngDto> seg = new ArrayList<>();
                for (JsonNode pt : e.get("geometry")) {
                    seg.add(new LatLngDto(pt.path("lat").asDouble(),
                            pt.path("lon").asDouble()));
                }
                wayGeom.put(id, seg);
            }
        }

        // 5) 순서대로 합치기 (중복 방지)
        List<LatLngDto> orderedPath = new ArrayList<>();
        LatLngDto last = null;

        for (Long wayId : wayOrder) {
            List<LatLngDto> seg = wayGeom.getOrDefault(wayId, List.of());
            if (seg.isEmpty()) continue;

            // — 방향 맞추기 로직 시작 —
            LatLngDto first = seg.get(0);
            LatLngDto end   = seg.get(seg.size() - 1);
            if (last != null) {
                if (first.equals(last)) {
                    // 정상 방향, 그대로
                } else if (end.equals(last)) {
                    // 뒤집어서 붙여야 할 경우
                    Collections.reverse(seg);
                } else {
                    // 그래도 연결점이 없으면, 가장 가까운 쪽을 앞쪽으로
                    double distToFirst = haversine(last.getLat(), last.getLng(),
                            first.getLat(), first.getLng());
                    double distToEnd   = haversine(last.getLat(), last.getLng(),
                            end.getLat(),   end.getLng());
                    if (distToEnd < distToFirst) {
                        Collections.reverse(seg);
                    }
                }
            }
            // — 방향 맞추기 로직 끝 —

            // 중복 없이 붙이기
            for (LatLngDto p : seg) {
                if (!p.equals(last)) {
                    orderedPath.add(p);
                    last = p;
                }
            }
        }

// 6) 보간(옵션) 및 반환
        return densifyPath(orderedPath, 0.02);
    }



    private double haversine(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // 지구 반경 (km)
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon/2) * Math.sin(dLon/2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    private List<LatLngDto> densifyPath(List<LatLngDto> path, double maxSegDistKm) {
        List<LatLngDto> dense = new ArrayList<>();
        for (int i = 1; i < path.size(); i++) {
            LatLngDto p0 = path.get(i - 1);
            LatLngDto p1 = path.get(i);
            dense.add(p0);

            double distKm = haversine(p0.getLat(), p0.getLng(), p1.getLat(), p1.getLng());
            int segments = (int) Math.ceil(distKm / maxSegDistKm);
            for (int s = 1; s < segments; s++) {
                double t = (double) s / segments;
                double lat = p0.getLat() + (p1.getLat() - p0.getLat()) * t;
                double lng = p0.getLng() + (p1.getLng() - p0.getLng()) * t;
                dense.add(new LatLngDto(lat, lng));
            }
        }
        // 마지막 점도 추가
        if (!path.isEmpty()) {
            dense.add(path.get(path.size() - 1));
        }
        return dense;
    }

}
