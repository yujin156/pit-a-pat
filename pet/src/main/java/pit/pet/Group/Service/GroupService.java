package pit.pet.Group.Service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pit.pet.Group.Reposity.GroupReposity;
import pit.pet.Group.Reposity.ProfileReposity;
import pit.pet.Group.Request.GruopRequest;
import pit.pet.Group.entity.Group;
import pit.pet.Group.entity.Profile;

@Service
@RequiredArgsConstructor
public class GroupService {
    private final GroupReposity groupReposity;
    private final ProfileReposity profileReposity;

    public void createGroup(GruopRequest request) {
        Profile profile = profileReposity.findById(request.getPno()).orElseThrow(() -> new RuntimeException("프로필이 없습니다."));

        Group group = new Group();
        group.setGname(request.getGname());
        group.setGmembercount(1);
        group.setProfile(profile);

        groupReposity.save(group);
    }
}
