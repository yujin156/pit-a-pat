package pit.pet.Board.Request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BoardCreateRequest {
    private Long blno;
//    private Long gno;         // 그룹 번호 (선택된 그룹 기준 전달)
    private Long dno;        // 프로필(개) 번호
    private String content;  // 게시글 본문 내용
}
