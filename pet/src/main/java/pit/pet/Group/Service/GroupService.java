package pit.pet.Group.Service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pit.pet.Account.User.Dog;
import pit.pet.Board.Entity.BoardListTable;
import pit.pet.Board.Repository.BoardListRepository;
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
    private final BoardListRepository boardListRepository;

    /**
     * 그룹 생성
     * - 그룹명, 생성자 강아지를 받아서 그룹 생성
     * - 생성자도 그룹 멤버로 등록 + 상태는 ACCEPTED
     * - 생성자의 gmno를 그룹의 g_leader로 설정
     */
    public GroupTable createGroup(String gname,
                                  String groupInfo,
                                  String interest,
                                  Dog dog) {
        // 1. 그룹 객체 생성 및 설정
        GroupTable group = new GroupTable();
        group.setGname(gname);
        group.setGinfo(groupInfo);
        group.setInterest(interest);
        group.setGmembercount(1);
        group.setDog(dog);

        groupRepository.save(group);

        // 2. 그룹 멤버(생성자) 등록
        GroupMemberTable creator = new GroupMemberTable();
        creator.setGroupTable(group);
        creator.setDog(dog);
        creator.setState(MemberStatus.ACCEPTED);
        groupMemberRepository.save(creator);

        // 3. 그룹 리더 설정
        group.setGleader(creator.getGmno());

        // 4. 기본 게시판 생성
        BoardListTable boardList = new BoardListTable();
        boardList.setGroupTable(group);
        boardList.setBlContent("기본 게시판");
        boardListRepository.save(boardList);

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
