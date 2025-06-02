package pit.pet.recommand;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import pit.pet.Account.Repository.DogRepository;
import pit.pet.Account.User.Dog;
import pit.pet.Review.TrailPost;
import pit.pet.Review.TrailPostRepository;

import java.util.List;
@Service
@RequiredArgsConstructor
public class TrailAiRecommendService {

    private final DogRepository dogRepository;
    private final TrailPostRepository trailPostRepository;
    private final RestTemplate restTemplate;

    private final String LAMBDA_URL = "https://779xwusi07.execute-api.ap-northeast-2.amazonaws.com/prod/";

    public List<Long> getAiRecommendedTrails(Long dogId) {
        Dog dog = dogRepository.findById(dogId)
                .orElseThrow(() -> new IllegalArgumentException("강아지를 찾을 수 없음"));

        TrailPost recentPost = trailPostRepository.findTopByDogOrderByCreatedAtDesc(dog)
                .orElseThrow(() -> new IllegalArgumentException("최근 게시글이 없음"));

        RecommendRequestDto requestDto = new RecommendRequestDto(dogId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<RecommendRequestDto> entity = new HttpEntity<>(requestDto, headers);

        ResponseEntity<String> response = restTemplate.exchange(
                LAMBDA_URL,
                HttpMethod.POST,
                entity,
                String.class
        );

        if (response.getStatusCode() == HttpStatus.OK) {
            ObjectMapper objectMapper = new ObjectMapper();
            try {
                JsonNode root = objectMapper.readTree(response.getBody());
                String bodyText = root.get("body").asText();

                // 정상인지 확인
                if (bodyText.contains("error")) {
                    throw new RuntimeException("Lambda 오류 응답: " + bodyText);
                }

                return objectMapper.readValue(bodyText, new TypeReference<List<Long>>() {});
            } catch (Exception e) {
                throw new RuntimeException("Lambda 응답 파싱 실패: " + e.getMessage());
            }
        } else {
            throw new RuntimeException("Lambda 호출 실패: " + response.getStatusCode());
        }
    }
}
