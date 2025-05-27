package pit.pet.Board.Request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BoardLikeRequest {
    private Long bno;  // 게시글 번호
    private Long dno;  // 프로필(개) 번호
}