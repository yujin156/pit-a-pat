package pit.pet.Board.Service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pit.pet.Account.Repository.DogRepository;
import pit.pet.Account.Repository.UserRepository;
import pit.pet.Account.User.Dog;
import pit.pet.Account.User.User;
import pit.pet.Board.Entity.BoardCommentTable;
import pit.pet.Board.Entity.BoardTable;
import pit.pet.Board.Repository.BoardCommentRepository;
import pit.pet.Board.Repository.BoardRepository;
import pit.pet.Board.Request.BoardCommentCreateRequest;
import pit.pet.Board.Request.BoardCommentUpdateRequest;
import pit.pet.Group.Repository.GroupMemberRepository;
import pit.pet.Group.entity.GroupMemberTable;
import pit.pet.Group.entity.GroupTable;
import pit.pet.Group.entity.MemberStatus;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BoardCommentService {

    private final BoardRepository boardRepository;
    private final DogRepository dogRepository;
    private final BoardCommentRepository commentRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;

    @Transactional
    public Long getDefaultDnoForGroup(Long gno, Long userId) {
        // 유저의 강아지 목록 가져오기
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 유저를 찾을 수 없습니다."));

        List<Dog> myDogs = dogRepository.findByOwner(user);  // 유저가 소유한 모든 강아지들

        System.out.println("그룹 번호 (gno): " + gno);

        // 그룹에 가입된 강아지들 목록 가져오기 (ACCEPTED 상태인 강아지들만)
        List<GroupMemberTable> groupMembers = groupMemberRepository.findByGroupTable_GnoAndState(gno, MemberStatus.ACCEPTED);
        System.out.println("그룹에 가입된 멤버들: " + groupMembers);  // 그룹에 가입된 멤버 출력

        List<Dog> dogsInGroup = groupMembers.stream()
                .map(groupMember -> groupMember.getDog())  // 그룹에 가입된 강아지들
                .collect(Collectors.toList());

        // 강아지들 및 유저 소유 강아지 출력
        System.out.println("그룹에 가입된 강아지들: " + dogsInGroup);
        System.out.println("유저가 소유한 강아지들: " + myDogs);

        // 유저의 강아지들 중 해당 그룹에 가입된 강아지 찾기
        for (Dog dog : myDogs) {
            if (dogsInGroup.contains(dog)) {
                return dog.getDno();  // 그룹에 가입된 강아지의 dno를 반환
            }
        }

        // 그룹에 가입된 강아지가 없다면 예외 처리
        throw new IllegalArgumentException("이 그룹에 가입된 강아지가 없습니다.");
    }

    // 댓글 작성
    @Transactional
    public BoardCommentTable createComment(BoardCommentCreateRequest request, Long dno) {
        BoardTable board = boardRepository.findById(request.getBno())
                .orElseThrow(() -> new IllegalArgumentException("게시글이 존재하지 않습니다."));

        Dog dog = dogRepository.findById(dno)   // 🔥 여기서 dno를 파라미터로 직접 받음!
                .orElseThrow(() -> new IllegalArgumentException("강아지 정보가 존재하지 않습니다."));

        GroupTable group = board.getGroup();
        System.out.println("group: " + (group != null ? group.getGno() : "null") + ", dog: " + (dog != null ? dog.getDno() : "null"));  // group과 dog DNO 확인
        if (group == null) {
            throw new IllegalArgumentException("게시글에 그룹 정보가 없습니다.");
        }

        boolean isMember = groupMemberRepository.existsByGroupTableAndDogAndState(group, dog, MemberStatus.ACCEPTED);
        if (!isMember) {
            throw new IllegalArgumentException("이 강아지는 해당 그룹에 가입되어 있지 않아 댓글을 작성할 수 없습니다.");
        }

        BoardCommentTable comment = new BoardCommentTable();
        comment.setBoard(board);
        comment.setDog(dog);
        comment.setBccomment(request.getContent());

        return commentRepository.save(comment);
    }

    // 댓글 수정
    @Transactional
    public BoardCommentTable updateComment(BoardCommentUpdateRequest request, Long dno) {
        BoardCommentTable comment = commentRepository.findById(request.getBcno())
                .orElseThrow(() -> new IllegalArgumentException("댓글이 존재하지 않습니다."));

        if (!comment.getDog().getDno().equals(dno)) {
            throw new IllegalArgumentException("수정 권한이 없습니다.");
        }

        comment.setBccomment(request.getContent());
        return commentRepository.save(comment);
    }

    public void updateCommentByForm(Long bcno, Long dno, String content) {
        BoardCommentTable comment = commentRepository.findById(bcno)
                .orElseThrow(() -> new IllegalArgumentException("댓글 없음"));

        if (!comment.getDog().getDno().equals(dno)) {
            throw new SecurityException("수정 권한 없음");
        }

        comment.setBccomment(content);

        commentRepository.save(comment);
    }

    public Long getBoardNoByComment(Long bcno) {
        return commentRepository.findById(bcno)
                .orElseThrow(() -> new IllegalArgumentException("댓글 없음"))
                .getBoard().getBno();
    }

    // 댓글 수정 (REST)
    @Transactional
    public void updateCommentByApi(Long cno, BoardCommentUpdateRequest request, User currentUser) { // dno 대신 User 객체를 받음
        BoardCommentTable comment = commentRepository.findById(cno)
                .orElseThrow(() -> new IllegalArgumentException("댓글이 존재하지 않습니다."));

        Dog commentDog = comment.getDog();
        if (commentDog == null || !commentDog.getOwner().equals(currentUser)) { // 댓글 작성 강아지의 주인이 현재 유저인지 확인
            throw new IllegalArgumentException("수정 권한이 없습니다.");
        }

        comment.setBccomment(request.getContent());
        commentRepository.save(comment);
    }

    // 댓글 삭제 (REST)
    @Transactional
    public void deleteCommentByApi(Long cno, User currentUser) { // dno 대신 User 객체를 받음
        BoardCommentTable comment = commentRepository.findById(cno)
                .orElseThrow(() -> new IllegalArgumentException("댓글이 존재하지 않습니다."));

        Dog commentDog = comment.getDog();
        if (commentDog == null || !commentDog.getOwner().equals(currentUser)) { // 댓글 작성 강아지의 주인이 현재 유저인지 확인
            throw new IllegalArgumentException("삭제 권한이 없습니다.");
        }

        commentRepository.delete(comment);
    }


    // 댓글 삭제
    @Transactional
    public void deleteComment(Long bcno, Long dno) {
        BoardCommentTable comment = commentRepository.findById(bcno)
                .orElseThrow(() -> new IllegalArgumentException("댓글이 존재하지 않습니다."));

        Long writerDno = comment.getDog().getDno();

        System.out.println("🟡 [댓글 삭제 요청]");
        System.out.println(" - 요청 bcno: " + bcno);
        System.out.println(" - 로그인한 dno: " + dno);
        System.out.println(" - 댓글 작성자 dno: " + writerDno);

        if (!comment.getDog().getDno().equals(dno)) {
            throw new IllegalArgumentException("삭제 권한이 없습니다.");
        }

        commentRepository.delete(comment);
        System.out.println("✅ 댓글 삭제 완료: bcno=" + bcno);
    }
    // 게시글에 대한 모든 댓글 조회
    @Transactional
    public List<BoardCommentTable> getCommentsByBoard(Long bno) {
        BoardTable board = boardRepository.findById(bno)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 존재하지 않습니다."));
        return commentRepository.findByBoard(board);
    }
}