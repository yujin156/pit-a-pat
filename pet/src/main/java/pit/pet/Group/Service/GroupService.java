package pit.pet.Group.Service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import pit.pet.Account.User.Dog;
import pit.pet.Group.Repository.GroupMemberRepository;
import pit.pet.Group.Repository.GroupRepository;
import pit.pet.Group.Request.CreateGroupRequest;
import pit.pet.Group.entity.GroupMemberTable;
import pit.pet.Group.entity.GroupTable;
import pit.pet.Group.entity.Keyword;
import pit.pet.Group.entity.MemberStatus;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;

    /**
     * 그룹 생성
     * - 그룹명, 생성자 강아지를 받아서 그룹 생성
     * - 생성자도 그룹 멤버로 등록 + 상태는 ACCEPTED
     * - 생성자의 gmno를 그룹의 g_leader로 설정
     */
    @Transactional
    public GroupTable createGroup(CreateGroupRequest request, Dog dog) {
        GroupTable group = new GroupTable();
        group.setGname(request.getGname());
        group.setGmembercount(1);

        String keyword = request.getInterest() != null ? request.getInterest().toUpperCase() : "BREED";
        group.setGkeyword(Keyword.valueOf(keyword));
        group.setDog(dog);

        group.setGcontent(request.getGroupInfo());
        group.setGuploadedat(LocalDateTime.now());

        if (request.getGimg() != null && !request.getGimg().isEmpty()) {
            try {
                // 이 부분 나중에 클라우드 스토리지 경로로 바꿀것
                String uploadDir = "C:/Users/user1/Desktop/pit-a-pat/pet/src/main/resources/static/uploads/img";
                String filename = UUID.randomUUID() + "_" + request.getGimg().getOriginalFilename();
                Path filepath = Paths.get(uploadDir, filename);
                Files.createDirectories(filepath.getParent());
                Files.copy(request.getGimg().getInputStream(), filepath, StandardCopyOption.REPLACE_EXISTING);

                group.setGimg("/uploads/img/" + filename); // ⭐️ 여기만 이렇게 고쳐!
            } catch (Exception e) {
                throw new RuntimeException("이미지 저장 실패", e);
            }
        }

        // ✅ 생성자 멤버 등록
        GroupMemberTable creator = new GroupMemberTable();
        creator.setGroupTable(group);
        creator.setDog(dog);
        creator.setState(MemberStatus.ACCEPTED);

        groupMemberRepository.save(creator);

        // ✅ 리더 설정 후 최종 저장 (이미지, gcontent, guploadedat까지 전부 한번에 저장!)
        group.setGleader(creator.getGmno());
        return groupRepository.save(group);
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

    public void changeLeader(Long gno, Long currentLeaderGmno, Long newLeaderGmno) {
        GroupTable group = groupRepository.findById(gno)
                .orElseThrow(() -> new RuntimeException("그룹이 존재하지 않습니다."));

        if (!group.getGleader().equals(currentLeaderGmno)) {
            throw new RuntimeException("리더만 권한을 위임할 수 있습니다.");
        }

        GroupMemberTable newLeader = groupMemberRepository.findById(newLeaderGmno)
                .orElseThrow(() -> new RuntimeException("대상 멤버가 존재하지 않습니다."));

        if (!newLeader.getGroupTable().equals(group)) {
            throw new RuntimeException("같은 그룹 소속이 아닙니다.");
        }

        group.setGleader(newLeaderGmno);
        groupRepository.save(group);
    }

    public GroupTable findById(Long gno) {
        return groupRepository.findById(gno)
                .orElseThrow(() -> new RuntimeException("해당 그룹이 존재하지 않습니다."));
    }
}