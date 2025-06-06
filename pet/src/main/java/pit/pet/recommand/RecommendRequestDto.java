package pit.pet.recommand;

import lombok.*;

// RecommendRequestDto.java
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class RecommendRequestDto {
    private Long dogId;
    private String city;   // 시/도 코드
    private String county; // 시/군/구 코드
    private String town;   // 읍/면/동 코드

    // 기존에 dogId만 있던 구조라면, 아래처럼 확장
}