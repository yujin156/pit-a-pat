package pit.pet.trail;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/trail")
public class TrailController {

    private final TrailService trailService;
    private final ObjectMapper objectMapper;
    private final TrailRepository trailRepository;
    @GetMapping("/trail-save")
    public ResponseEntity<String> testTrailSaveGet() {
        try {
            int saved = trailService.fetchAndSaveFromKeyword("서울 둘레길");
            return ResponseEntity.ok(saved + "개의 Trail 저장 완료");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }


    @GetMapping("/trail-save-multi")
    public ResponseEntity<String> saveMultipleTrailSets() {
        List<String> keywords = List.of(
                "서울 둘레길", "경기 둘레길", "부산 둘레길",
                "제주 둘레길", "대구 둘레길", "강원도 둘레길",
                "전남 둘레길", "울산 둘레길"
        );

        int saved = trailService.fetchAndSaveFromKeywords(keywords);
        return ResponseEntity.ok(saved + "개의 Trail 저장 완료");
    }


    @GetMapping("/load-overpass")
    public ResponseEntity<String> saveFromOverpass(
            @RequestParam(name = "name") String trailName) throws Exception {

        // 1) 순서 보장된 경로 리스트 가져오기
        List<LatLngDto> path = trailService.fetchOrderedRoute(trailName);

        if (path.isEmpty()) {
            return ResponseEntity
                    .badRequest()
                    .body("경로 데이터가 없습니다: " + trailName);
        }

        // 2) 총 거리 계산 (km 단위)
        double totalDistanceKm = calculateTotalDistance(path);

        // 3) Trail 엔티티 생성
        Trail trail = new Trail();
        trail.setName(trailName);
        trail.setLengthKm(totalDistanceKm);
        trail.setDifficulty("EASY");
        trail.setSidoCode("11");
        trail.setSigunguCode("11230");
        trail.setEmdCode("11230640");

        // 4) JSON 변환 후 저장
        try {
            String json = objectMapper.writeValueAsString(path);
            trail.setPathJson(json);
        } catch (JsonProcessingException e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("JSON 변환 실패: " + e.getMessage());
        }

        // 5) DB 저장
        trailRepository.save(trail);
        return ResponseEntity.ok(
                String.format("Trail 저장 완료! 총 거리: %.2f km", totalDistanceKm)
        );
    }


    @GetMapping("/{id}/path")
    public ResponseEntity<List<LatLngDto>> getTrailPath(@PathVariable Long id) throws JsonProcessingException {
        Trail trail = trailRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Trail not found: " + id));
        // DB에 저장된 JSON 문자열을 List<LatLngDto>로 변환
        List<LatLngDto> path = objectMapper.readValue(
                trail.getPathJson(),
                new TypeReference<List<LatLngDto>>() {}
        );
        return ResponseEntity.ok(path);
    }

    // Haversine 공식으로 두 좌표 사이 거리 계산 (km)


    // path 리스트를 순회하며 구간별 거리 합산

    private double calculateTotalDistance(List<LatLngDto> path) {
        double total = 0;
        for (int i = 1; i < path.size(); i++) {
            LatLngDto prev = path.get(i - 1);
            LatLngDto curr = path.get(i);
            total += haversine(prev.getLat(), prev.getLng(),
                    curr.getLat(), curr.getLng());
        }
        return total;
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
}