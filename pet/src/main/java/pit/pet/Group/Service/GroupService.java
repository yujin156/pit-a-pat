package pit.pet.Group.Service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pit.pet.Account.User.Dog;
import pit.pet.Group.Repository.GroupMemberRepository;
import pit.pet.Group.Repository.GroupRepository;
import pit.pet.Group.entity.GroupMemberTable;
import pit.pet.Group.entity.GroupTable;
import pit.pet.Group.entity.MemberStatus;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GroupService {
    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;

    /**
     * ✅ 그룹 생성
     * - 그룹명, 생성자 강아지를 받아서 그룹 생성
     * - 생성자도 그룹 멤버로 등록 + 상태는 ACCEPTED
     * - 생성자의 gmno를 그룹의 g_leader로 설정
     */
    @Transactional
    public GroupTable createGroup(String gname, Dog dog) {
        // 1. 그룹 객체 생성
        GroupTable group = new GroupTable();
        group.setGname(gname);
        group.setGmembercount(1); // 생성자 포함 1명

        group.setDog(dog);

        // 2. 일단 그룹 저장 (gno 생성)
        groupRepository.save(group);

        // 3. 그룹 생성자 멤버 등록
        GroupMemberTable creator = new GroupMemberTable();
        creator.setGroupTable(group);
        creator.setDog(dog);
        creator.setState(MemberStatus.ACCEPTED); // 생성자는 승인 상태

        // 4. 멤버 저장
        groupMemberRepository.save(creator);

        // 5. 생성자의 gmno를 그룹 리더로 등록
        group.setGleader(creator.getGmno());
        return groupRepository.save(group); // 최종 저장
    }

    /**
     * ✅ 그룹 조회
     */
    public GroupTable findGroup(Long gno) {
        return groupRepository.findById(gno)
                .orElseThrow(() -> new RuntimeException("해당 그룹이 존재하지 않습니다."));
    }

    public List<GroupTable> getAllGroups() {
        return groupRepository.findAll();
    }

}
