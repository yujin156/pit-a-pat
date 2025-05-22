package pit.pet.Board.Controller;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import pit.pet.Board.Service.BoardManageService;

@Controller
@RequiredArgsConstructor
@RequestMapping("/board")
public class BoardManageController {

    private final BoardManageService boardManageService;

    // ✅ 게시글 좋아요 토글
    @PostMapping("/like")
    public String toggleLike(@RequestParam Long bno, HttpSession session) {
        Long dno = (Long) session.getAttribute("dno");
        boardManageService.toggleLike(bno, dno);
        return "redirect:/board/view/" + bno; // 게시글 상세로 리다이렉트
    }

    // ✅ 게시글 북마크 토글
    @PostMapping("/bookmark")
    public String toggleBookmark(@RequestParam Long bno, HttpSession session) {
        Long dno = (Long) session.getAttribute("dno");
        boardManageService.toggleBookmark(bno, dno);
        return "redirect:/board/view/" + bno;
    }
}