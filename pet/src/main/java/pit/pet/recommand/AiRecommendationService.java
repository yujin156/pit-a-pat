package pit.pet.recommand;

import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AiRecommendationService {

    private final RestTemplate restTemplate = new RestTemplate();

    public List<String> getRecommendations(String prompt) {
        String url = "http://localhost:8000/recommend";  // FastAPI 주소

        // 요청 구성
        RecommendationRequest request = new RecommendationRequest(prompt);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<RecommendationRequest> entity = new HttpEntity<>(request, headers);

        // POST 요청 실행
        ResponseEntity<RecommendationResponse> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                RecommendationResponse.class
        );

        // 결과 반환
        return response.getBody().getRecommendations();
    }
}