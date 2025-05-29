package pit.pet.Group.Request;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
@NoArgsConstructor
public class    CreateGroupRequest {
    private String gname;
    private Long dogId;
    private String groupInfo;
    private String interest;  // ✅ 꼭 있어야 해! 이름 같아야 해!
    private MultipartFile gimg;
}


