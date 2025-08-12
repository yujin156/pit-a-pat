package pit.pet.recommand;


import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pit.pet.Account.Repository.DogRepository;
import pit.pet.Account.User.Dog;
import pit.pet.trail.Trail;
import pit.pet.trail.TrailDto;
import pit.pet.trail.TrailRepository;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class RecommendController {

    private final DogRepository dogRepository;
    private final TrailRepository trailRepository;
    private final AiRecommendationService aiService;

    @GetMapping("/recommend")
    public ResponseEntity<List<TrailDto>> recommend(@RequestParam Long dogId) {
        // 1. 강아지 정보 조회
        Dog dog = dogRepository.findById(dogId)
                .orElseThrow(() -> new IllegalArgumentException("해당 dogId의 강아지가 없습니다."));

        // 2. 프롬프트 생성
        String prompt = PromptBuilder.fromDog(dog);

        // 3. FastAPI 호출하여 추천 이름 리스트 받기
        List<String> recommendedNames = aiService.getRecommendations(prompt);

        // 4. 추천 이름으로 Trail DB 조회
        List<Trail> trails = trailRepository.findByNameIn(recommendedNames);

        // 5. DTO로 변환 후 반환
        List<TrailDto> trailDtos = trails.stream()
                .map(TrailDto::from)
                .toList();

        return ResponseEntity.ok(trailDtos);
    }
}