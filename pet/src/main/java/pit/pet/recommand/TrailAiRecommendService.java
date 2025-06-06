package pit.pet.recommand;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import pit.pet.Account.Repository.DogRepository;
import pit.pet.Account.User.Address;
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

        // 강아지 → 유저 → 주소(코드) 가져오기
        Address address = dog.getOwner().getAddress();
        if (address == null) {
            throw new IllegalArgumentException("주소 정보가 없습니다.");
        }

        // 최신 게시글 등 필요한 로직 유지 (필요 없으면 제거)
        TrailPost recentPost = trailPostRepository.findTopByDogOrderByCreatedAtDesc(dog)
                .orElseThrow(() -> new IllegalArgumentException("최근 게시글이 없음"));

        // AI 서버에 전달할 Dto 생성 (코드만 넘김)
        RecommendRequestDto requestDto = new RecommendRequestDto(
                dogId,
                address.getCity(),   // 시/도 코드
                address.getCounty(), // 시/군/구 코드
                address.getTown()    // 읍/면/동 코드
        );

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
