package pit.pet.recommand;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import pit.pet.Account.User.DogSize;
import pit.pet.Review.TrailPost;
import pit.pet.Review.TrailPostRepository;
import pit.pet.Review.TrailPostService;
import pit.pet.trail.TrailController;
import pit.pet.trail.TrailRepository;

import java.util.List;
import java.util.Map;
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/recommend")
public class RecommendController {

    private final AiRecommendService aiRecommendService;
    private final TrailRepository trailRepository;
    private final TrailPostService trailPostService;

    @GetMapping("/by-review")
    public ResponseEntity<List<TrailController.TrailSummaryDto>> recommendByReview(@RequestParam Long dogId) {
        List<Long> ids = aiRecommendService.recommendByLatestReview(dogId);

        List<TrailController.TrailSummaryDto> list = trailRepository.findAllById(ids)
                .stream()
                .map(t -> new TrailController.TrailSummaryDto(
                        t.getId(),
                        t.getName(),
                        t.getLengthKm(),
                        t.getStartLat(),
                        t.getStartLng(),
                        t.getEndLat(),
                        t.getEndLng(),
                        trailPostService.getAverageRatingByTrail(t.getId())
                ))
                .toList();

        return ResponseEntity.ok(list);
    }

}
