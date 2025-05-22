package pit.pet.Board.Request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BoardBookmarkRequest {
    private Long bno;      // 게시글 번호
    private Long dno;      // 프로필(개) 번호
    private Boolean marked; // true면 북마크함, false면 해제
}
