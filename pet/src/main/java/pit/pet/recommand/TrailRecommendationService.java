package pit.pet.recommand;

import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import pit.pet.Account.Repository.DogRepository;
import pit.pet.Account.User.Address;
import pit.pet.Account.User.Dog;
import pit.pet.Review.TrailPostRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TrailRecommendationService {

    private final DogRepository dogRepository;
    private final TrailPostRepository trailPostRepo;
    private final RestTemplate restTemplate;

    public RecommendRequestDto createRequest(Long dogId) {
        Dog dog = dogRepository.findById(dogId).orElseThrow();
        Address addr = dog.getOwner().getAddress();

        List<TrailPostSummaryDto> posts = trailPostRepo
                .findTop5ByDogOrderByCreatedAtDesc(dog)
                .stream()
                .map(p -> new TrailPostSummaryDto(
                        p.getTrail().getId(),
                        p.getRating(),
                        p.getContent()))
                .toList();

        return new RecommendRequestDto(
                dogId,
                dog.getSize().name(),
                addr.getCity(),
                addr.getCounty(),
                addr.getTown(),
                posts
        );
    }

    public List<Long> getRecommendationsFromLambda(Long dogId) {
        RecommendRequestDto request = createRequest(dogId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<RecommendRequestDto> entity = new HttpEntity<>(request, headers);

        String lambdaUrl = "https://your-lambda-url.amazonaws.com/recommend";  // ★ 여기에 실제 Lambda URL 입력

        ResponseEntity<List> response = restTemplate.exchange(
                lambdaUrl,
                HttpMethod.POST,
                entity,
                List.class
        );

        return response.getBody();  // 추천 Trail ID 리스트
    }
}
