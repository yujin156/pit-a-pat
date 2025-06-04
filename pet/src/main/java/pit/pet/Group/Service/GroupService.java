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
        // 그룹 존재 여부 확인
        GroupTable group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("그룹이 존재하지 않습니다."));

        System.out.println("Group ID: " + groupId); // 그룹 ID 콘솔 출력

        // 1. 그룹 리더 확인 (dno는 리더 강아지의 dno, 주인의 userId와 비교)
        Long leaderDno = group.getGleader();  // 리더 강아지의 dno
        System.out.println("Leader DNO: " + leaderDno); // 리더 DNO 콘솔 출력

        Optional<Dog> leaderDogOpt = dogRepository.findById(leaderDno);  // 강아지 ID로 강아지 찾기
        if (leaderDogOpt.isPresent()) {
            Dog leaderDog = leaderDogOpt.get();
            System.out.println("Leader Dog Owner User ID: " + leaderDog.getOwner().getUno()); // 리더 강아지의 주인 userId 콘솔 출력

            // 리더 강아지의 주인의 userId와 비교
            if (leaderDog.getOwner().getUno().equals(userId)) {
                System.out.println("User is the LEADER");
                return "LEADER";  // 리더인 경우
            }
        }

        // 2. 그룹 멤버 확인 (state가 ACCEPTED인 멤버만 멤버로 인정)
        boolean isMember = group.getGroupMembers().stream()
                .anyMatch(member -> {
                    boolean isMatchingUser = member.getDog().getOwner().getUno().equals(userId);
                    System.out.println("Checking member - Dog Owner User ID: " + member.getDog().getOwner().getUno() + ", Is matching user: " + isMatchingUser);
                    return isMatchingUser && member.getState() == MemberStatus.ACCEPTED; // 상태가 ACCEPTED인 멤버
                });

        if (isMember) {
            System.out.println("User is a MEMBER");
            return "MEMBER"; // ACCEPTED 상태인 멤버인 경우
        }

        System.out.println("User is NOT JOINED");
        return "NOT_JOINED"; // 비가입자일 경우
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