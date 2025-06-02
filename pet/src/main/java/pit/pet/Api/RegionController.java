package pit.pet.Api;

import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
@RestController
@RequestMapping("/api/regions")
@RequiredArgsConstructor
public class RegionController {

    private final SgisRegionService regionService;

    /** 시/도 전체 조회 */
    @GetMapping(value = "/sido", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<RegionDto>> getSido() {
        List<RegionDto> list = regionService.getSido();
        return ResponseEntity.ok(list);
    }

    /** 시/도의 시/군/구 조회 (code=시도 코드) */
    @GetMapping(value = "/sigungu", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<RegionDto>> getSigungu(
            @RequestParam("code") String sidoCode) {
        // 서비스에서 빈 리스트를 돌려주므로 바로 반환
        List<RegionDto> list = regionService.getSigungu(sidoCode);
        return ResponseEntity.ok(list);
    }

    /** 시/군/구의 읍/면/동 조회 (code=시군구 코드) */
    @GetMapping(value = "/dong", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<RegionDto>> getDong(
            @RequestParam("code") String sigunguCode) {
        List<RegionDto> list = regionService.getDong(sigunguCode);
        return ResponseEntity.ok(list);
    }
}