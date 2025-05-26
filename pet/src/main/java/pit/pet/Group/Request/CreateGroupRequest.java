package pit.pet.Group.Request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateGroupRequest {
    private String gname;
    private String groupInfo;  // 모임 소개
    private String interest;   // 선택한 관심사
    private Long dogId;        // 생성자 강아지 번호
}
