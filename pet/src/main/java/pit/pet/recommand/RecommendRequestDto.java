package pit.pet.recommand;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter
@AllArgsConstructor
@NoArgsConstructor
public class RecommendRequestDto {
    private Long userId;
    private Long dogId;

    private String dogSize;

    private String sidoCode;
    private String sigunguCode;
    private String emdCode;

    private Double temperature;
    private Boolean isRaining;
}
