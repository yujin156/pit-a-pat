package pit.pet.Group.Service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import pit.pet.Account.Repository.DogRepository;
import pit.pet.Account.Repository.UserRepository;
import pit.pet.Account.User.Dog;
import pit.pet.Account.User.User;
import pit.pet.Group.Repository.GroupMemberRepository;
import pit.pet.Group.Repository.GroupRepository;
import pit.pet.Group.entity.GroupMemberTable;
import pit.pet.Group.entity.GroupTable;
import pit.pet.Group.entity.MemberStatus;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class GroupMemberService {
    private final GroupMemberRepository groupMemberRepository;
    private final GroupRepository groupRepository;
    private final UserRepository userRepository;
    private final DogRepository dogRepository;

    /**
     * ✅ 그룹 가입 신청 (대기 상태로 등록)
     */
    public GroupMemberTable applyMembership(Long gno, Dog dog) {
        GroupTable group = groupRepository.findById(gno)
                .orElseThrow(() -> new RuntimeException("해당 그룹이 존재하지 않습니다."));

        // 중복 가입 방지 (선택)
        Optional<GroupMemberTable> exists = groupMemberRepository.findByDogAndGroupTable(dog, group);
        if (exists.isPresent()) {
            throw new RuntimeException("이미 가입 신청 또는 등록된 강아지입니다.");
        }

        GroupMemberTable member = new GroupMemberTable();
        member.setGroupTable(group);
        member.setDog(dog);
        member.setState(MemberStatus.WAIT); // 기본 상태

        return groupMemberRepository.save(member);
    }

    /**
     * ✅ 가입 요청 승인된 그룹만 - 내 그룹으로
     */

    public Long getLeaderGmnoByGroup(Long gno) {
        // LEADER 상태의 멤버 리스트 중 첫 번째(보통 1명일 것) gmno 반환
        List<GroupMemberTable> leaders = groupMemberRepository.findByGroupTable_GnoAndState(gno, MemberStatus.LEADER);
        if (leaders.isEmpty()) {
            return null;
        }
        return leaders.get(0).getGmno();
    }


    public List<GroupMemberTable> findByDogsAndStatus(List<Dog> dogs, String status) {
        MemberStatus memberStatus = MemberStatus.valueOf(status); // 예: "APPROVED"를 ENUM으로 변환
        return groupMemberRepository.findByDogInAndState(dogs, memberStatus);
    }

    public List<GroupMemberTable> getWaitMembers(Long gno) {
        return groupMemberRepository.findByGroupTable_GnoAndState(gno, MemberStatus.WAIT);
    }
    /**
     * ✅ 가입 요청 승인 / 거부 (리더만 가능)
     */

    public List<GroupMemberTable> getWaitingMembers(Long gno) {
        return groupMemberRepository.findByGroupTable_GnoAndState(gno, MemberStatus.WAIT);
    }
    public List<GroupMemberTable> findByDogs(List<Dog> dogs) {
        return groupMemberRepository.findByDogIn(dogs);
    }

    /**
     * ✅ 현재 로그인 유저의 강아지들 중 그룹 리더인지 판단
     */
    public Long getLeaderGmno(Long gno, List<Dog> myDogs) {
        GroupTable group = groupRepository.findById(gno)
                .orElseThrow(() -> new RuntimeException("그룹이 존재하지 않습니다. ID: " + gno));

        Long leaderDogDno = group.getGleader(); // 그룹에 저장된 리더 강아지의 DNO
        if (leaderDogDno == null) {
            System.out.println("[GroupMemberSVC getLeaderGmno] Group (gno:" + gno + ") has no leader_dno set.");
            return null;
        }

        // 그룹의 모든 멤버를 순회하며, 리더 강아지 dno와 일치하는 dno를 가진 멤버를 찾습니다.
        for (GroupMemberTable member : group.getGroupMembers()) { // group.getGroupMembers() 사용
            if (member.getDog() != null && leaderDogDno.equals(member.getDog().getDno())) {
                System.out.println("[GroupMemberSVC getLeaderGmno] Leader found for group (gno:" + gno + "). Member gmno: " + member.getGmno() + ", Dog dno: " + member.getDog().getDno());
                return member.getGmno(); // 해당 멤버의 gmno 반환
            }
        }
        System.out.println("[GroupMemberSVC getLeaderGmno] Could not find a group member whose dog's dno matches the group's leader_dno (" + leaderDogDno + ") for group (gno:" + gno + ").");
        return null; // 리더에 해당하는 멤버를 찾지 못한 경우
    }

    public void handleJoinRequest(Long gmno, MemberStatus status, UserDetails principal) {
        GroupMemberTable member = groupMemberRepository.findById(gmno)
                .orElseThrow(() -> new RuntimeException("가입 요청 멤버가 존재하지 않습니다."));
        GroupTable group = member.getGroupTable();

        // principal에서 유저 정보와, 해당 유저가 가진 강아지들의 dno들 조회
        User user = userRepository.findByUemail(principal.getUsername())
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));
        List<Dog> myDogs = dogRepository.findByOwner(user);

        // 리더 dog.dno와 내 dog.dno가 일치하는지 체크
        boolean isLeader = myDogs.stream().anyMatch(dog -> dog.getDno().equals(group.getGleader()));
        if (!isLeader) {
            throw new RuntimeException("가입 승인 또는 거부 권한이 없습니다. (리더만 가능)");
        }

        // 상태 변경 로직
        if (status == MemberStatus.ACCEPTED) {
            if (member.getState() != MemberStatus.ACCEPTED) {
                member.setState(MemberStatus.ACCEPTED);
                group.setGmembercount(group.getGmembercount() + 1);
                groupRepository.save(group);
            }
            groupMemberRepository.save(member);
        } else if (status == MemberStatus.REJECTED) {
            // 무조건 삭제 (가입 요청 거부)
            groupMemberRepository.delete(member);
        }
    }


    public List<GroupMemberTable> getAllMembers(Long gno) {
        return groupMemberRepository.findByGroupTable_Gno(gno);
    }


    /**
     * ✅ 멤버 탈퇴 (본인만 가능)
     */
    public void withdraw(Long gmno, Long requesterGmno) {
        if (!gmno.equals(requesterGmno)) {
            throw new RuntimeException("탈퇴는 본인만 가능합니다.");
        }

        GroupMemberTable member = groupMemberRepository.findById(gmno)
                .orElseThrow(() -> new RuntimeException("멤버 정보가 없습니다."));
        GroupTable group = member.getGroupTable();

        boolean wasAccepted = member.getState() == MemberStatus.ACCEPTED;

        groupMemberRepository.delete(member); // ✅ 먼저 멤버 삭제

        if (wasAccepted) {
            group.setGmembercount(group.getGmembercount() - 1);

            if (group.getGmembercount() == 0) {
                // ✅ 마지막 멤버였으면 그룹도 삭제
                groupRepository.delete(group);
            } else {
                groupRepository.save(group);
            }
        }
    }

    public boolean isInGroup(Long dno, Long gno) {
        return groupMemberRepository.existsByDog_DnoAndGroupTable_Gno(dno, gno);
    }
}