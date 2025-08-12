package pit.pet.trail;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class TrailDto {
    private Long id;
    private String name;
    private Double lengthKm;
    private String difficulty;

    private String sidoCode;
    private String sigunguCode;
    private String emdCode;
    private String regionName; // 서울시 강북구 수유동
    private Double averageRating; // ⭐ 추가
    private List<LatLngDto> path;

    public static TrailDto from(Trail trail) {
        ObjectMapper objectMapper = new ObjectMapper();
        List<LatLngDto> path = List.of();

        // JSON 파싱 처리
        try {
            path = objectMapper.readValue(trail.getPathJson(), new TypeReference<List<LatLngDto>>() {});
        } catch (Exception e) {
            e.printStackTrace(); // 또는 로깅 처리
        }

        // regionName, averageRating은 없으므로 기본값 또는 추후 계산
        return new TrailDto(
                trail.getId(),
                trail.getName(),
                trail.getLengthKm(),
                trail.getDifficulty(),
                trail.getSidoCode(),
                trail.getSigunguCode(),
                trail.getEmdCode(),
                trail.getSidoCode() + " " + trail.getSigunguCode() + " " + trail.getEmdCode(),  // regionName 생성
                0.0,  // averageRating: 추후 리뷰 기반 계산 가능
                path
        );
    }

}

