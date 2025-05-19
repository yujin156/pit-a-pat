package pit.pet.Group.Request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GruopRequest {
    private Long pno;             // 프로필 번호 (FK)
    private String gname;         // 그룹 이름
    private String gdescription;  // 필요한지는 물어볼것
}
