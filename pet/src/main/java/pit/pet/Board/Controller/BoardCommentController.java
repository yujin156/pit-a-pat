package pit.pet.Board.Controller;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import pit.pet.Board.Entity.BoardCommentTable;
import pit.pet.Board.Request.BoardCommentCreateRequest;
import pit.pet.Board.Request.BoardCommentUpdateRequest;
import pit.pet.Board.Service.BoardCommentService;

import java.util.List;

@Controller
@RequiredArgsConstructor
@RequestMapping("/board/comment")
public class BoardCommentController {

    private final BoardCommentService boardCommentService;

    // ✅ 댓글 등록
    @PostMapping("/create")
    public String createComment(@RequestParam Long bno,
                                @RequestParam Long dno,
                                @RequestParam String bccontent) {
        if (dno == null) return "redirect:/error"; // 로그인 안 한 상태 등 예외 처리

        BoardCommentCreateRequest request = new BoardCommentCreateRequest();
        request.setBno(bno);
        request.setDno(dno);
        request.setContent(bccontent);

        boardCommentService.createComment(request, dno);

        return "redirect:/board/view/" + bno;
    }

    // ✅ 댓글 수정
    @PutMapping("/update")
    public ResponseEntity<BoardCommentTable> updateComment(@RequestBody BoardCommentUpdateRequest request,
                                                           HttpSession session) {
        Long dno = (Long) session.getAttribute("dno");
        BoardCommentTable updated = boardCommentService.updateComment(request, dno);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{bcno}/edit")
    public String updateCommentByForm(@PathVariable Long bcno,
                                      @RequestParam Long dno,
                                      @RequestParam("bccomment") String newContent) {
        boardCommentService.updateCommentByForm(bcno, dno, newContent);

        // 댓글이 속한 게시글 번호 조회
        Long bno = boardCommentService.getBoardNoByComment(bcno);
        return "redirect:/board/view/" + bno;
    }

    // ✅ 댓글 삭제
    @PostMapping("/{bcno}/delete")
    public String deleteComment(@PathVariable Long bcno,
                                @RequestParam Long bno,
                                @RequestParam Long dno) {
        boardCommentService.deleteComment(bcno, dno);
        return "redirect:/board/view/" + bno;
    }

    // ✅ 특정 게시글의 댓글 목록 조회 (optional)
    @GetMapping("/list/{bno}")
    public ResponseEntity<List<BoardCommentTable>> getComments(@PathVariable Long bno) {
        List<BoardCommentTable> comments = boardCommentService.getCommentsByBoard(bno);
        return ResponseEntity.ok(comments);
    }
}