package pit.pet.Board.Request;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class BoardUpdateRequest {
    private Long bno;
    private String newContent;
    private List<Integer> deleteImgIds; // 삭제할 이미지 ID 목록
}