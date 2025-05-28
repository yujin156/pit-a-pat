package pit.pet.recommand;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TrailPostSummaryDto {
    private Long trailId;
    private int rating;       // 1~5
    private String content;   // 게시글 내용 일부
}
