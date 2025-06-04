package pit.pet.Board.Request;

import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.NotBlank; // 또는 javax.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull;

import java.util.List;

@Getter
@Setter
public class BoardUpdateRequest {

    @NotNull
    private Long bno;

    @NotBlank
    private String newContent;

    private List<Integer> deleteImgIds; // 삭제할 이미지 ID 목록
}