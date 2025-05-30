package pit.pet.Group.Request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateGroupRequest {
    private String gname;
    private Long dogId; // 생성자 강아지 번호
}
