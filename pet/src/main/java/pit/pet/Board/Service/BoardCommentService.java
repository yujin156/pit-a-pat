package pit.pet.Board.Service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pit.pet.Account.Repository.DogRepository;
import pit.pet.Account.User.Dog;
import pit.pet.Board.Entity.BoardCommentTable;
import pit.pet.Board.Entity.BoardTable;
import pit.pet.Board.Repository.BoardCommentRepository;
import pit.pet.Board.Repository.BoardRepository;
import pit.pet.Board.Request.BoardCommentCreateRequest;
import pit.pet.Board.Request.BoardCommentUpdateRequest;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BoardCommentService {

    private final BoardRepository boardRepository;
    private final DogRepository dogRepository;
    private final BoardCommentRepository commentRepository;

    // 댓글 작성
    @Transactional
    public BoardCommentTable createComment(BoardCommentCreateRequest request, Long dno) {
        BoardTable board = boardRepository.findById(request.getBno())
                .orElseThrow(() -> new IllegalArgumentException("게시글이 존재하지 않습니다."));

        Dog dog = dogRepository.findById(dno)   // 🔥 여기서 dno를 파라미터로 직접 받음!
                .orElseThrow(() -> new IllegalArgumentException("강아지 정보가 존재하지 않습니다."));

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