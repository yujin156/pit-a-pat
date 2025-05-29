package pit.pet.recommand;

import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import pit.pet.Account.Repository.DogRepository;
import pit.pet.Account.User.Address;
import pit.pet.Account.User.Dog;
import pit.pet.Account.User.DogSize;
import pit.pet.Review.TrailPost;
import pit.pet.Review.TrailPostRepository;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AiRecommendService {

    private final TrailPostRepository trailPostRepository;
    private final RestTemplate restTemplate;
    private final DogRepository dogRepository;

    public List<Long> recommendByLatestReview(Long dogId) {
        Dog dog = dogRepository.findById(dogId)
                .orElseThrow(() -> new IllegalArgumentException("해당 강아지를 찾을 수 없습니다."));

        TrailPost latestPost = trailPostRepository.findTopByDogOrderByCreatedAtDesc(dog)
                .orElseThrow(() -> new IllegalArgumentException("리뷰가 없습니다."));

        String content = latestPost.getContent();
        DogSize dogSize = latestPost.getDog().getSize();

        Map<String, Object> payload = Map.of(
                "review", content,
                "dog_size", dogSize.toString()
        );

        ResponseEntity<List> response = restTemplate.postForEntity(
                "https://your-lambda-url/recommend", payload, List.class
        );

        return response.getBody();
    }
}

