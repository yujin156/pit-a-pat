package pit.pet.Board.Controller;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import pit.pet.Account.Repository.DogRepository;
import pit.pet.Account.Repository.UserRepository;
import pit.pet.Account.Service.DogService;
import pit.pet.Account.User.Dog;
import pit.pet.Account.User.User;
import pit.pet.Board.Entity.BoardCommentTable;
import pit.pet.Board.Entity.BoardCommentTableDTO;
import pit.pet.Board.Request.BoardCommentCreateRequest;
import pit.pet.Board.Request.BoardCommentUpdateRequest;
import pit.pet.Board.Service.BoardCommentService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/board")
public class BoardCommentController {

    private final BoardCommentService boardCommentService;
    private final UserRepository userRepository;
    private final DogRepository dogRepository;
    private final DogService dogService;

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

    // 댓글 수정(REST)
    @PutMapping("/comment/api/comments/{cno}")
    public ResponseEntity<?> updateCommentApi(@PathVariable Long cno,
                                              @RequestBody BoardCommentUpdateRequest request,
                                              @AuthenticationPrincipal UserDetails principal) {
        User me = userRepository.findByUemail(principal.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("유저 정보 없음"));

        // 서비스에서 권한을 확인하도록 dno를 직접 넘기지 않거나,
        // 또는 실제 댓글 작성 강아지의 dno와 사용자 정보를 함께 넘겨 서비스에서 종합적으로 판단
        boardCommentService.updateCommentByApi(cno, request, me); // 'me' (User 객체)를 넘겨서 서비스에서 판단하도록 변경

        return ResponseEntity.ok().build();
    }

    // ✅ 댓글 삭제
    @PostMapping("/{bcno}/delete")
    public String deleteComment(@PathVariable Long bcno,
                                @RequestParam Long bno,
                                @RequestParam Long dno) {
        boardCommentService.deleteComment(bcno, dno);
        return "redirect:/board/view/" + bno;
    }

    // 댓글 삭제(REST)
    @DeleteMapping("/comment/api/comments/{cno}")
    public ResponseEntity<?> deleteCommentApi(@PathVariable Long cno,
                                              @AuthenticationPrincipal UserDetails principal) {
        User me = userRepository.findByUemail(principal.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("유저 정보 없음"));

        boardCommentService.deleteCommentByApi(cno, me); // 'me' (User 객체)를 넘겨서 서비스에서 판단하도록 변경

        return ResponseEntity.ok().build();
    }

    // ✅ 특정 게시글의 댓글 목록 조회 (optional)
    @GetMapping("/list/{bno}")
    public ResponseEntity<List<BoardCommentTable>> getComments(@PathVariable Long bno) {
        List<BoardCommentTable> comments = boardCommentService.getCommentsByBoard(bno);
        return ResponseEntity.ok(comments);
    }

    // ✅ 댓글 등록
    @PostMapping("/api/comments")
    @ResponseBody
    public Map<String, Object> createCommentApi(@RequestBody BoardCommentCreateRequest request,
                                                @AuthenticationPrincipal UserDetails principal) {
        System.out.println("게시글 번호 (bno): " + request.getBno());
        System.out.println("강아지 번호 (dno): " + request.getDno());
        System.out.println("댓글 내용 (content): " + request.getContent());
        System.out.println("그룹 번호 (gno): " + request.getGno());

        User me = userRepository.findByUemail(principal.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("유저 정보 없음"));

        Long gnoFromRequest = request.getGno();
        if (gnoFromRequest == null) {
            throw new IllegalArgumentException("그룹 번호가 필요합니다. (요청에서 누락됨)");
        }

        Long dnoToUseForComment = boardCommentService.getDefaultDnoForGroup(gnoFromRequest, me.getUno());

        BoardCommentTable comment = boardCommentService.createComment(request, dnoToUseForComment);


        Map<String, Object> result = new HashMap<>();
        result.put("bcno", comment.getBcno());
        result.put("bccomment", comment.getBccomment());
        result.put("dogName", comment.getDog().getDname()); // dnoToUseForComment 강아지의 이름

        result.put("dno", dnoToUseForComment);
        result.put("gno", gnoFromRequest); // 요청받은 gno

        return result;
    }

    // ✅ 게시글에 달린 댓글 목록 조회
    @GetMapping("/api/comments/{bno}")
    @ResponseBody
    public List<BoardCommentTableDTO> getCommentsApi(@PathVariable Long bno) {
        List<BoardCommentTable> comments = boardCommentService.getCommentsByBoard(bno);

        // BoardCommentTable을 BoardCommentTableDTO로 변환
        return comments.stream()
                .map(comment -> new BoardCommentTableDTO(comment, dogService)) // DTO로 변환
                .collect(Collectors.toList());
    }
}