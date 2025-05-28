package pit.pet.trail;

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
}

