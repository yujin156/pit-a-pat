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
        // 로그인 유저의 대표 강아지 dno 가져오기
        User me = userRepository.findByUemail(principal.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("유저 정보 없음"));
        List<Dog> myDogs = dogRepository.findByOwner(me);
        Long dno = myDogs.isEmpty() ? null : myDogs.get(0).getDno();

        boardCommentService.updateCommentByApi(cno, request, dno);

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
        List<Dog> myDogs = dogRepository.findByOwner(me);
        Long dno = myDogs.isEmpty() ? null : myDogs.get(0).getDno();

        boardCommentService.deleteCommentByApi(cno, dno);

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
        User me = userRepository.findByUemail(principal.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("유저 정보 없음"));

        // 🔥 대표 강아지 dno 자동 지정
        List<Dog> myDogs = dogRepository.findByOwner(me);
        Long dno = myDogs.isEmpty() ? null : myDogs.get(0).getDno();

        if (dno == null) {
            throw new IllegalStateException("강아지 정보가 없습니다!");
        }

        // 🔥 여기서 dno를 컨트롤러가 직접 지정
        BoardCommentTable comment = boardCommentService.createComment(request, dno);

        // 응답 JSON
        Map<String, Object> result = new HashMap<>();
        result.put("bcno", comment.getBcno());
        result.put("bccomment", comment.getBccomment());
        result.put("dogName", comment.getDog().getDname());
        return result;
    }

    // ✅ 게시글에 달린 댓글 목록 조회
    @GetMapping("/api/comments/{bno}")
    @ResponseBody
    public List<Map<String, Object>> getCommentsApi(@PathVariable Long bno) {
        List<BoardCommentTable> comments = boardCommentService.getCommentsByBoard(bno);

        return comments.stream().map(comment -> {
            Map<String, Object> map = new HashMap<>();
            map.put("bcno", comment.getBcno());
            map.put("bccomment", comment.getBccomment());
            map.put("dogName", comment.getDog().getDname());
            map.put("createdDate", comment.getCreatedAt());
            String profileUrl = dogService.getProfileImageUrl(comment.getDog().getDno());
            map.put("profileUrl", profileUrl);

            return map;
        }).collect(Collectors.toList());
    }
}