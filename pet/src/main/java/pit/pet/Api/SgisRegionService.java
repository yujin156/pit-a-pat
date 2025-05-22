package pit.pet.Api;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.StreamSupport;


@Service
public class SgisRegionService {
    private final RestTemplate rt;
    private final String key;
    private final String secret;
    private String cachedToken;
    private Instant tokenExpiry;

    public SgisRegionService(RestTemplateBuilder b,
                             @Value("${sgis.consumer.key}") String key,
                             @Value("${sgis.consumer.secret}") String secret) {
        this.rt = b.build();
        this.key = key;
        this.secret = secret;
    }

    // 1) 토큰 발급 (GET)
    private synchronized void ensureToken() {
        if (cachedToken != null && Instant.now().isBefore(tokenExpiry.minusSeconds(60))) {
            return;
        }
        String authUrl = String.format(
                "https://sgisapi.kostat.go.kr/OpenAPI3/auth/authentication.json" +
                        "?consumer_key=%s&consumer_secret=%s",
                key, secret
        );
        JsonNode authResp = rt.getForObject(authUrl, JsonNode.class);
        JsonNode result = authResp.get("result");
        cachedToken = result.get("accessToken").asText();
        long expiresIn = result.get("accessTimeout").asLong();
        tokenExpiry = Instant.now().plusSeconds(expiresIn);
    }

    // 2) 단계별 조회 (GET, pg_yn 사용)
    private List<RegionDto> fetchStage(String cd) {
        ensureToken();

        URI uri = UriComponentsBuilder
                .fromHttpUrl("https://sgisapi.kostat.go.kr/OpenAPI3/addr/stage.json")
                .queryParam("accessToken", cachedToken)
                .queryParam("pg_yn", "0")
                .queryParamIfPresent("cd", Optional.ofNullable(cd))
                .build().encode().toUri();

        JsonNode resp = rt.getForObject(uri, JsonNode.class);

        JsonNode arr = resp.path("result");
        if (!arr.isArray()) {
            // 오류 코드(-100)나 노드 없음 → 빈 리스트 반환
            return List.of();
        }

        return StreamSupport.stream(arr.spliterator(), false)
                .map(n -> new RegionDto(
                        n.path("cd").asText(),
                        n.path("addr_name").asText()
                ))
                .toList();
    }

    public String getFullAddress(String cityCode, String countyCode, String townCode){
        String townName = getNameByCode(countyCode, townCode);         // 읍면동 조회

        return String.format("%s",townName);
    }

    // 코드로 지역명 조회하는 내부 메서드
    private String getNameByCode(String parentCode, String targetCode) {
        List<RegionDto> regions = fetchStage(parentCode);
        return regions.stream()
                .filter(region -> region.code().equals(targetCode))
                .map(RegionDto::name)
                .findFirst()
                .orElse("알 수 없음");
    }
    public List<RegionDto> getSido() {
        return fetchStage(null);
    }

    public List<RegionDto> getSigungu(String sidoCode) {
        return fetchStage(sidoCode);
    }

    public List<RegionDto> getDong(String sigunguCode) {
        return fetchStage(sigunguCode);
    }
}
