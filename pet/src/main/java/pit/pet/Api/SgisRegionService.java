package pit.pet.Api;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import pit.pet.Account.User.Address;

import java.net.URI;
import java.time.Instant;
import java.util.List;
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

    public List<RegionDto> getSido() {
        return fetchStage(null); // null이면 시/도 전체
    }

    // 시/군/구 리스트 (시/도 코드 필요)
    public List<RegionDto> getSigungu(String sidoCode) {
        return fetchStage(sidoCode);
    }

    // 동(읍/면/동) 리스트 (시/군/구 코드 필요)
    public List<RegionDto> getDong(String sigunguCode) {
        return fetchStage(sigunguCode);
    }


    // 시도 코드로 이름
    public String getSidoName(String sidoCode) {
        return fetchStage(null).stream()
                .filter(r -> r.code().equals(sidoCode))
                .map(RegionDto::name)
                .findFirst().orElse("Unknown");
    }

    // 시군구 코드로 이름
    public String getSigunguName(String sidoCode, String sigunguCode) {
        return fetchStage(sidoCode).stream()
                .filter(r -> r.code().equals(sigunguCode))
                .map(RegionDto::name)
                .findFirst().orElse("Unknown");
    }

    // 동 코드로 이름 (시군구코드로 리스트 → 동코드 매칭)
    public String getDongName(String sigunguCode, String dongCode) {
        return fetchStage(sigunguCode).stream()
                .filter(r -> r.code().equals(dongCode))
                .map(RegionDto::name)
                .findFirst().orElse("Unknown");
    }

    // Address(코드만) → 풀주소 ("시도 시군구 읍면동")
    public String toFullAddress(Address addr) {
        String sido = getSidoName(addr.getCity());
        String sigungu = getSigunguName(addr.getCity(), addr.getCounty());
        String dong = getDongName(addr.getCounty(), addr.getTown());
        return sido + " " + sigungu + " " + dong;
    }
    public String getFullAddress(String cityCode, String countyCode, String townCode) {
        String sidoName = getSidoName(cityCode); // 시도 코드 → 이름
        String sigunguName = getSigunguName(cityCode, countyCode); // 시도, 시군구 코드 → 이름
        String dongName = getDongName(countyCode, townCode); // 시군구 코드, 동 코드 → 이름

        // 이름을 조합해서 "시도 시군구 동" 형태로 반환
        return String.format("%s %s %s", sidoName, sigunguName, dongName);
    }
    // 풀주소 → 위경도/코드 변환
    public RegionCodeResult getRegionCodesFromAddress(String fullAddress) {
        ensureToken();

        URI geocodeUri = UriComponentsBuilder
                .fromHttpUrl("https://sgisapi.kostat.go.kr/OpenAPI3/addr/geocode.json")
                .queryParam("accessToken", cachedToken)
                .queryParam("address", fullAddress)
                .build().encode().toUri();

        JsonNode geoResp = rt.getForObject(geocodeUri, JsonNode.class);
        JsonNode geoResult = geoResp.path("result").get(0);
        double x = geoResult.path("x").asDouble(); // 경도
        double y = geoResult.path("y").asDouble(); // 위도

        return new RegionCodeResult(x, y);
    }

    // Address(코드만) → 위경도 변환 (통합)
    public RegionCodeResult getGeoByAddress(Address addr) {
        String fullAddress = toFullAddress(addr);
        return getRegionCodesFromAddress(fullAddress);
    }

}
