package pit.pet.recommand;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class RecommendRequestDto {
    private Long dogId;
    private String dogSize;  // SMALL / MEDIUM / LARGE

    private String sidoCode;
    private String sigunguCode;
    private String emdCode;

    private List<TrailPostSummaryDto> recentPosts;  // 최근 게시글 요약
}
