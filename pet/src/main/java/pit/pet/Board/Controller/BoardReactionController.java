package pit.pet.Board.Controller;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pit.pet.Board.Service.BoardManageService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/board/reaction")
public class BoardReactionController {

    private final BoardManageService boardManageService;

    // ✅ 좋아요 토글
    @PostMapping("/like/{bno}")
    public ResponseEntity<?> toggleLike(@PathVariable Long bno, HttpSession session) {
        Long dno = (Long) session.getAttribute("dno");
        boolean result = boardManageService.toggleLike(bno, dno);

        Map<String, Object> response = new HashMap<>();
        response.put("message", result ? "좋아요 추가됨" : "좋아요 취소됨");
        response.put("liked", result);
        return ResponseEntity.ok(response);
    }

    // ✅ 북마크 토글
    @PostMapping("/bookmark/{bno}")
    public ResponseEntity<?> toggleBookmark(@PathVariable Long bno, HttpSession session) {
        Long dno = (Long) session.getAttribute("dno");
        boolean result = boardManageService.toggleBookmark(bno, dno);

        Map<String, Object> response = new HashMap<>();
        response.put("message", result ? "북마크 추가됨" : "북마크 취소됨");
        response.put("bookmarked", result);
        return ResponseEntity.ok(response);
    }
}