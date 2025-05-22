package pit.pet.Board.Request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BoardCommentUpdateRequest {
    private Long bcno;     // 댓글 번호
    private String content;
}
