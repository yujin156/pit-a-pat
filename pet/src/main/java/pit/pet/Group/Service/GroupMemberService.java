package pit.pet.Group.Service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pit.pet.Account.User.Dog;
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
                .orElseThrow(() -> new RuntimeException("그룹이 존재하지 않습니다."));

        for (Dog dog : myDogs) {
            Optional<GroupMemberTable> memberOpt = groupMemberRepository.findByGroupTableAndDog(group, dog);
            if (memberOpt.isPresent()) {
                Long gmno = memberOpt.get().getGmno();
                if (group.getGleader().equals(gmno)) {
                    return gmno; // ✅ 리더 맞음
                }
            }
        }

        throw new RuntimeException("가입 승인 또는 거부 권한이 없습니다.");
    }

    public void handleJoinRequest(Long gmno, MemberStatus status, Long leaderGmno) {
        GroupMemberTable member = groupMemberRepository.findById(gmno)
                .orElseThrow(() -> new RuntimeException("가입 요청 멤버가 존재하지 않습니다."));
        GroupTable group = member.getGroupTable();

        // 리더 권한 확인
        if (!group.getGleader().equals(leaderGmno)) {
            throw new RuntimeException("가입 승인 또는 거부 권한이 없습니다.");
        }

        if (status == MemberStatus.ACCEPTED) {
            // 상태가 처음 승인될 경우에만 인원수 +1
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
