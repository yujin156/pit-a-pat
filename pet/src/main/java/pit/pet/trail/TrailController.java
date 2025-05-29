package pit.pet.trail;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pit.pet.Review.TrailPost;
import pit.pet.Review.TrailPostService;

import java.util.List;

@RestController
@RequestMapping("/api/trails")
@RequiredArgsConstructor
public class TrailController {
    private final TrailService trailService;
    private final TrailRepository trailRepository;
    private final ObjectMapper objectMapper;
    private final TrailPostService trailPostService;

    @GetMapping
    public ResponseEntity<List<TrailSummaryDto>> listTrails() {
        List<TrailSummaryDto> list = trailRepository.findAll().stream()
                .map(t -> new TrailSummaryDto(
                        t.getId(), t.getName(), t.getLengthKm(),
                        t.getStartLat(), t.getStartLng(),
                        t.getEndLat(), t.getEndLng(),
                        trailPostService.getAverageRatingByTrail(t.getId())
                ))
                .toList();
        return ResponseEntity.ok(list);
    }
    @GetMapping("/load-overpass")
    public ResponseEntity<String> saveSingle(@RequestParam String name) throws Exception {
        return ResponseEntity.ok(trailService.fetchAndSaveSingle(name));
    }

    @GetMapping("/auto-save-seoul")
    public ResponseEntity<String> saveAllSeoul() {
        int saved = trailService.fetchAndSaveAllSeoulTrails();
        return ResponseEntity.ok(saved + "개의 서울 둘레길 저장 완료");
    }
    @GetMapping("/trail-save-multi")
    public ResponseEntity<String> saveMulti() {
        List<String> kws = List.of("서울 둘레길", "경기 둘레길", "부산 둘레길",
                "제주 둘레길", "대구 둘레길", "강원 둘레길",
                "전남 둘레길", "울산 둘레길");
        int saved = trailService.fetchAndSaveFromKeywords(kws);
        return ResponseEntity.ok(saved + "개 저장 완료");
    }

    @GetMapping("/{id}/path")
    public ResponseEntity<List<LatLngDto>> getPath(@PathVariable Long id) throws Exception {
        Trail t = trailRepository.findById(id)
                .orElseThrow(EntityNotFoundException::new);
        List<LatLngDto> path = objectMapper.readValue(
                t.getPathJson(), new TypeReference<>() {});
        return ResponseEntity.ok(path);
    }


    public record TrailSummaryDto(
            Long id,
            String name,
            double lengthKm,
            Double startLat,
            Double startLng,
            Double endLat,
            Double endLng,
            Double averageRating  // ⭐ 평균 별점 추가
    ) {}

}