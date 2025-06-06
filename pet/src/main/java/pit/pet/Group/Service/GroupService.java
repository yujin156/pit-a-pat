package pit.pet.Group.Service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import pit.pet.Account.Repository.DogRepository;
import pit.pet.Account.User.Dog;
import pit.pet.Account.User.User;
import pit.pet.Group.Repository.GroupMemberRepository;
import pit.pet.Group.Repository.GroupRepository;
import pit.pet.Group.Request.CreateGroupRequest;
import pit.pet.Group.entity.*;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final DogRepository dogRepository;

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
                String uploadDir = System.getProperty("user.dir") + "/pet/src/main/resources/static/uploads/img";
                String filename = UUID.randomUUID() + "_" + request.getGimg().getOriginalFilename();
                Path filepath = Paths.get(uploadDir, filename);
                Files.createDirectories(filepath.getParent());
                Files.copy(request.getGimg().getInputStream(), filepath, StandardCopyOption.REPLACE_EXISTING);
                System.out.println("✅ 이미지 저장 경로: " + filepath.toAbsolutePath());

                group.setGimg("/uploads/img/" + filename);
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
        group.setGleader(dog.getDno());
        return groupRepository.save(group);
    }


    /**
     * ✅ 그룹 조회
     */
    public GroupTable findGroup(Long gno) {
        return groupRepository.findById(gno)
                .orElseThrow(() -> new RuntimeException("해당 그룹이 존재하지 않습니다."));
    }

    public List<GroupTableDTO> getAllGroups() {
        // GroupTable을 GroupTableDTO로 변환해서 반환
        return groupRepository.findAll().stream()
                .map(group -> new GroupTableDTO(
                        group.getGno(),
                        group.getGname(),
                        group.getGinfo(),
                        group.getInterest(),
                        group.getGmembercount(),
                        group.getGleader(),
                        group.getGcontent(),
                        group.getGimg(),
                        group.getGkeyword()
                ))
                .collect(Collectors.toList());
    }

    // 로그인한 사용자의 그룹 목록을 DTO로 반환
    public List<GroupTableDTO> getMyGroups(User me) {
        // 유저의 강아지 목록 가져오기
        List<Dog> myDogs = dogRepository.findByOwner(me);

        // 강아지 목록을 기준으로 그룹 멤버 조회
        List<GroupMemberTable> memberships = groupMemberRepository.findByDogIn(myDogs);

        return memberships.stream()
                .map(groupMember -> new GroupTableDTO(
                        groupMember.getGroupTable().getGno(),
                        groupMember.getGroupTable().getGname(),
                        groupMember.getGroupTable().getGinfo(),
                        groupMember.getGroupTable().getInterest(),
                        groupMember.getGroupTable().getGmembercount(),
                        groupMember.getGroupTable().getGleader(),
                        groupMember.getGroupTable().getGcontent(),
                        groupMember.getGroupTable().getGimg(),
                        groupMember.getGroupTable().getGkeyword()
                ))
                .collect(Collectors.toList());
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

    public String checkUserStatus(Long groupId, Long userId) {
        GroupTable group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("그룹이 존재하지 않습니다. ID: " + groupId));

        System.out.println("[SVC checkUserStatus] Group ID: " + groupId + ", User ID: " + userId);

        Long leaderDno = group.getGleader();
        System.out.println("[SVC checkUserStatus] Group's stored leaderDno: " + leaderDno);

        if (leaderDno == null) {
            System.out.println("[SVC checkUserStatus] Stored leaderDno is NULL. Cannot determine leader via this DNO.");
        } else {
            Optional<Dog> leaderDogOpt = dogRepository.findById(leaderDno);
            if (leaderDogOpt.isPresent()) {
                Dog leaderDog = leaderDogOpt.get();
                Long leaderDogOwnerUno = leaderDog.getOwner().getUno();
                System.out.println("[SVC checkUserStatus] Leader Dog (dno:" + leaderDno + ") Owner's UNO: " + leaderDogOwnerUno);

                if (leaderDogOwnerUno.equals(userId)) {
                    System.out.println("[SVC checkUserStatus] User IS THE LEADER.");
                    return "LEADER";
                } else {
                    System.out.println("[SVC checkUserStatus] User is NOT the owner of the leader dog. Current user UNO: " + userId + ", Leader dog owner UNO: " + leaderDogOwnerUno);
                }
            } else {
                System.out.println("[SVC checkUserStatus] Leader Dog (dno:" + leaderDno + ") NOT FOUND in dogRepository.");
            }
        }

        // 그룹 멤버 확인 로직 (기존과 동일하게 유지하되, 로그 추가 가능)
        boolean isMember = group.getGroupMembers().stream()
                .anyMatch(member -> {
                    boolean isOwnerOfMemberDog = member.getDog().getOwner().getUno().equals(userId);
                    // System.out.println("[SVC checkUserStatus] Checking member - Dog: " + member.getDog().getDname() + ", Owner UNO: " + member.getDog().getOwner().getUno() + ", Is current user: " + isOwnerOfMemberDog + ", Member State: " + member.getState());
                    return isOwnerOfMemberDog && member.getState() == MemberStatus.ACCEPTED;
                });

        if (isMember) {
            System.out.println("[SVC checkUserStatus] User is a MEMBER (but not identified as leader).");
            return "MEMBER";
        }

        System.out.println("[SVC checkUserStatus] User is NOT_JOINED.");
        return "NOT_JOINED";
    }


    public Long getLeaderGmno(Long gno, List<Dog> myDogs) {
        GroupTable group = groupRepository.findById(gno)
                .orElseThrow(() -> new RuntimeException("그룹이 존재하지 않습니다."));

        for (Dog dog : myDogs) {
            // 해당 그룹에 강아지가 속해 있는지 확인
            Optional<GroupMemberTable> memberOpt = groupMemberRepository.findByGroupTableAndDog(group, dog);

            // 강아지가 그룹의 멤버일 경우
            if (memberOpt.isPresent()) {
                Long gmno = memberOpt.get().getGmno();

                // 해당 강아지가 리더인지 확인 (gleader는 그룹 리더의 dno를 나타냄)
                if (group.getGleader().equals(dog.getDno())) {
                    return gmno; // 리더일 경우 해당 gmno 반환
                }
            }
        }

        // 리더가 아닌 경우 null 반환 (리더가 아님)
        return null;  // 예외 던지지 않고 null 반환
    }

}