package pit.pet.trail;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import pit.pet.Account.Repository.DogRepository;
import pit.pet.Account.User.Dog;
import pit.pet.Review.TrailPostRepository;
import pit.pet.Review.TrailPostService;
import pit.pet.recommand.AiRecommendationService;
import pit.pet.recommand.PromptBuilder;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
@RequiredArgsConstructor
public class TrailService {
    private final TrailRepository trailRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final TrailPostRepository reviewRepository;
    private final DogRepository dogRepository;
    private final PromptBuilder promptBuilder;
    private final AiRecommendationService aiRecommendationService; // ✅ 추가
    private final TrailPostService trailPostService;


    private String classifyDifficulty(double km) {
        if (km < 5.0)         return "EASY";
        else if (km < 10.0)   return "MEDIUM";
        else                  return "HARD";
    }

    public List<LatLngDto> fetchOrderedRoute(String name) throws Exception {
        String query = String.format(
                "[out:json][timeout:25];\n" +
                        "area[\"name\"=\"서울특별시\"][\"boundary\"=\"administrative\"]->.seoul;\n" +
                        "relation[\"route\"=\"hiking\"][\"type\"=\"route\"][\"name\"=\"%s\"](area.seoul);\n" +
                        "out body meta;\n(._; >;);\nout geom;",
                name
        );
        MultiValueMap<String,String> form = new LinkedMultiValueMap<>();
        form.add("data", query);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        HttpEntity<MultiValueMap<String,String>> req = new HttpEntity<>(form, headers);

        JsonNode root = restTemplate.postForObject(
                "https://overpass-api.de/api/interpreter", req, JsonNode.class);
        JsonNode elems = root.path("elements");
        if (!elems.isArray()) throw new IllegalStateException("elements가 없습니다.");

        JsonNode relation = StreamSupport.stream(elems.spliterator(), false)
                .filter(e -> "relation".equals(e.path("type").asText()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("relation이 없습니다."));

        List<Long> wayOrder = new ArrayList<>();
        for (JsonNode m : relation.path("members")) {
            if ("way".equals(m.path("type").asText())) {
                wayOrder.add(m.path("ref").asLong());
            }
        }

        Map<Long,List<LatLngDto>> wayGeom = new HashMap<>();
        for (JsonNode e : elems) {
            if ("way".equals(e.path("type").asText()) && e.has("geometry")) {
                List<LatLngDto> seg = new ArrayList<>();
                for (JsonNode pt : e.path("geometry")) {
                    seg.add(new LatLngDto(pt.path("lat").asDouble(), pt.path("lon").asDouble()));
                }
                wayGeom.put(e.path("id").asLong(), seg);
            }
        }

        List<List<LatLngDto>> segments = new ArrayList<>();
        LatLngDto last = null;
        for (Long id : wayOrder) {
            List<LatLngDto> seg = wayGeom.getOrDefault(id, List.of());
            if (seg.isEmpty()) continue;

            // 방향 맞추기
            LatLngDto first = seg.get(0), end = seg.get(seg.size()-1);
            if (last != null) {
                double dF = haversine(last, first);
                double dE = haversine(last, end);
                if (dE < dF) Collections.reverse(seg);
            }

            // 중복 없이 붙인 새로운 세그먼트
            List<LatLngDto> cleanSeg = new ArrayList<>();
            for (LatLngDto p : seg) {
                if (!p.equals(last)) {
                    cleanSeg.add(p);
                    last = p;
                }
            }

            segments.add(cleanSeg);
        }

        // 2) 각 세그먼트별로만 densify
        List<LatLngDto> refined = new ArrayList<>();
        for (List<LatLngDto> seg : segments) {
            List<LatLngDto> dense = densifyPath(seg, 0.005);  // 5m 단위
            for (LatLngDto p : dense) {
                // 경계 중복 제거
                if (refined.isEmpty() || !p.equals(refined.get(refined.size()-1))) {
                    refined.add(p);
                }
            }
        }

        return refined;
    }
    public List<String> fetchAllSeoulTrailNames() throws Exception {
        String query =
                "[out:json][timeout:25];\n" +
                        "area[\"name\"=\"서울특별시\"][\"boundary\"=\"administrative\"]->.seoul;\n" +
                        "relation[\"route\"=\"hiking\"][\"type\"=\"route\"](area.seoul);\n" +
                        "out tags;";

        MultiValueMap<String,String> form = new LinkedMultiValueMap<>();
        form.add("data", query);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        HttpEntity<MultiValueMap<String,String>> req = new HttpEntity<>(form, headers);

        JsonNode root = restTemplate.postForObject(
                "https://overpass-api.de/api/interpreter", req, JsonNode.class);
        JsonNode elems = root.path("elements");
        if (!elems.isArray()) throw new IllegalStateException("elements가 없습니다.");

        return StreamSupport.stream(elems.spliterator(), false)
                .filter(e -> "relation".equals(e.path("type").asText()))
                .map(e -> e.path("tags").path("name").asText())
                .distinct()
                .collect(Collectors.toList());
    }

    private double haversine(LatLngDto a, LatLngDto b) {
        final int R = 6371;
        double dLat = Math.toRadians(b.getLat()-a.getLat());
        double dLon = Math.toRadians(b.getLng()-a.getLng());
        double sinDlat = Math.sin(dLat/2), sinDlon = Math.sin(dLon/2);
        double aa = sinDlat*sinDlat
                + Math.cos(Math.toRadians(a.getLat()))
                * Math.cos(Math.toRadians(b.getLat()))
                * sinDlon*sinDlon;
        return 2 * R * Math.atan2(Math.sqrt(aa), Math.sqrt(1-aa));
    }

    private List<LatLngDto> densifyPath(List<LatLngDto> path, double maxSegKm) {
        List<LatLngDto> dense = new ArrayList<>();
        for (int i = 1; i < path.size(); i++) {
            LatLngDto p0 = path.get(i-1), p1 = path.get(i);
            dense.add(p0);
            double dist = haversine(p0, p1);
            int steps = (int)Math.ceil(dist / maxSegKm);
            for (int s = 1; s < steps; s++) {
                double t = (double)s/steps;
                double lat = p0.getLat() + (p1.getLat()-p0.getLat())*t;
                double lng = p0.getLng() + (p1.getLng()-p0.getLng())*t;
                dense.add(new LatLngDto(lat, lng));
            }
        }
        if (!path.isEmpty()) dense.add(path.get(path.size()-1));
        return dense;
    }

    public double calculateTotalDistance(List<LatLngDto> path) {
        double sum = 0;
        for (int i = 1; i < path.size(); i++) {
            sum += haversine(path.get(i-1), path.get(i));
        }
        return sum;
    }

    @Transactional
    public int fetchAndSaveFromKeywords(List<String> names) {
        int cnt = 0;
        for (String name : names) {
            try {
                List<LatLngDto> path = fetchOrderedRoute(name);
                if (path.isEmpty()) continue;
                double km = calculateTotalDistance(path);
                String diff = classifyDifficulty(km);
                Trail t = Trail.builder()
                        .name(name).lengthKm(km).difficulty(diff)
                        .sidoCode("11").sigunguCode("").emdCode("")
                        .startLat(path.get(0).getLat()).startLng(path.get(0).getLng())
                        .endLat(path.get(path.size()-1).getLat()).endLng(path.get(path.size()-1).getLng())
                        .pathJson(objectMapper.writeValueAsString(path))
                        .build();
                trailRepository.save(t);
                cnt++;
            } catch (Exception e) {
                // log and continue
            }
        }
        return cnt;
    }
    @Transactional
    public int fetchAndSaveAllSeoulTrails() {
        try {
            List<String> names = fetchAllSeoulTrailNames();
            int count = 0;
            for (String name : names) {
                try {
                    fetchAndSaveSingle(name);
                    count++;
                } catch (Exception ignore) {}
            }
            return count;
        } catch (Exception e) {
            throw new RuntimeException("서울 둘레길 자동 저장 실패", e);
        }
    }

    public String fetchAndSaveSingle(String name) throws Exception {
        List<LatLngDto> path = fetchOrderedRoute(name);
        if (path.isEmpty()) return "경로 없음: " + name;

        double km = calculateTotalDistance(path);
        String diff = classifyDifficulty(km);

        Trail t = Trail.builder()
                .name(name)
                .lengthKm(km)
                .difficulty(diff)
                .sidoCode("11").sigunguCode("").emdCode("")
                .startLat(path.get(0).getLat())
                .startLng(path.get(0).getLng())
                .endLat(path.get(path.size()-1).getLat())
                .endLng(path.get(path.size()-1).getLng())
                .pathJson(objectMapper.writeValueAsString(path))
                .build();
        trailRepository.save(t);
        return String.format("저장 완료: %s (%s, %.2fkm)", name, diff, km);
    }

    public List<TrailDto> recommendByDog(Long dogId) {
        Dog dog = dogRepository.findById(dogId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 강아지"));

        String prompt = promptBuilder.buildPrompt(dog);
        List<String> recommendedNames = aiRecommendationService.getRecommendations(prompt); // AI 추천

        System.out.println("🐶 추천된 이름 리스트: " + recommendedNames);

        // 추천이 비어있다면 기본 키워드 사용
        List<String> finalRecommendedNames = recommendedNames.isEmpty()
                ? List.of("서울", "북한산", "제주") // or 임의 키워드
                : recommendedNames;

        List<Trail> allTrails = trailRepository.findAll();
        System.out.println("📦 전체 트레일 수: " + allTrails.size());

        // 이름 필터 (공백 제거 후 포함되는지 확인)
        List<Trail> matchedTrails = allTrails.stream()
                .filter(trail -> finalRecommendedNames.stream()
                        .anyMatch(recommend ->
                                trail.getName().replaceAll("\\s+", "")
                                        .contains(recommend.replaceAll("\\s+", "")))
                )
                .toList();

        System.out.println("🎯 최종 추천 트레일 수: " + matchedTrails.size());
        System.out.println("✅ 추천된 트레일 이름:");
        matchedTrails.forEach(t -> System.out.println(" - " + t.getName()));

        return matchedTrails.stream()
                .map(trail -> {
                    List<LatLngDto> path = parsePath(trail.getPathJson());
                    return new TrailDto(
                            trail.getId(), trail.getName(), trail.getLengthKm(),
                            trail.getDifficulty(),
                            trail.getSidoCode(), trail.getSigunguCode(), trail.getEmdCode(),
                            trail.getSidoCode() + " " + trail.getSigunguCode() + " " + trail.getEmdCode(),
                            trailPostService.getAverageRatingByTrail(trail.getId()),
                            path
                    );
                })
                .toList();
    }




    private List<LatLngDto> parsePath(String json) {
        try {
            return objectMapper.readValue(json, new com.fasterxml.jackson.core.type.TypeReference<List<LatLngDto>>() {});
        } catch (Exception e) {
            return List.of();
        }
    }
    
}

