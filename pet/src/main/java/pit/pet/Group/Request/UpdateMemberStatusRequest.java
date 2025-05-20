package pit.pet.Group.Request;

import lombok.Getter;
import lombok.Setter;
import pit.pet.Group.entity.MemberStatus;

@Getter
@Setter
public class UpdateMemberStatusRequest {
    private MemberStatus status;     // 승인 또는 거부
    private Long leaderGmno;         // 해당 그룹의 리더(요청자)의 그룹멤버 번호
}
