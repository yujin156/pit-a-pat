package pit.pet.recommand;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
@Service
public class LambdaService {

    private final RestTemplate rt = new RestTemplate();

    public List<Long> invokeTrailRecommendation(RecommendRequestDto dto) {
        String lambdaUrl = "https://your-lambda-url.amazonaws.com/default/recommendTrail";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<RecommendRequestDto> entity = new HttpEntity<>(dto, headers);
        ResponseEntity<JsonNode> response = rt.exchange(lambdaUrl, HttpMethod.POST, entity, JsonNode.class);

        JsonNode trailIds = response.getBody().path("recommendedTrailIds");
        List<Long> ids = new ArrayList<>();
        trailIds.forEach(idNode -> ids.add(idNode.asLong()));
        return ids;
    }
}
