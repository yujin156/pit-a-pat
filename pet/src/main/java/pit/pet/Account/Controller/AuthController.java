package pit.pet.Account.Controller;

import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import pit.pet.Account.Service.PasswordResetService;

@Controller
@RequiredArgsConstructor
public class AuthController {
    private final PasswordResetService resetSvc;

    // 1) 이메일 입력 폼
    @GetMapping("/user/find-password")
    public String findForm() {
        return "auth/find-password";
    }

    // 2) 인증 코드 발송
    @PostMapping("/user/find-password")
    public String sendCode(@RequestParam String email, RedirectAttributes rttr) {
        try {
            resetSvc.generateAndSendCode(email);  // 여기에서 MessagingException이 던져짐
            rttr.addFlashAttribute("msg", "인증 코드를 보냈습니다.");
        } catch (IllegalArgumentException | MessagingException e) {
            rttr.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/user/find-password";
    }

    // 3) 인증 코드 입력 폼
    @GetMapping("/user/verify-code")
    public String verifyForm(Model model, @ModelAttribute("email") String email) {
        model.addAttribute("email", email);
        return "auth/verify-code";
    }

    // 4) 인증 코드 검증
    @PostMapping("/user/verify-code")
    public String verifyCode(
            @RequestParam String email,
            @RequestParam String code,
            HttpSession session,
            RedirectAttributes rttr
    ) {
        try {
            resetSvc.validateCode(email, code);
            session.setAttribute("resetEmail", email);
            return "redirect:/user/reset-password";
        } catch (IllegalArgumentException e) {
            rttr.addFlashAttribute("error", e.getMessage());
            rttr.addFlashAttribute("email", email);
            return "redirect:/user/verify-code";
        }
    }

    // 5) 비밀번호 재설정 폼
    @GetMapping("/user/reset-password")
    public String resetForm(Model model, HttpSession session) {
        String email = (String) session.getAttribute("resetEmail");
        if (email == null) return "redirect:/user/find-password";
        model.addAttribute("email", email);
        return "auth/reset-password";
    }

    // 6) 새 비밀번호 저장
    @PostMapping("/user/reset-password")
    public String resetPassword(
            @RequestParam String newPassword,
            HttpSession session,
            RedirectAttributes rttr
    ) {
        String email = (String) session.getAttribute("resetEmail");
        if (email == null) return "redirect:/user/find-password";
        resetSvc.resetPassword(email, newPassword);
        session.removeAttribute("resetEmail");
        rttr.addFlashAttribute("msg", "비밀번호가 성공적으로 변경되었습니다.");
        return "redirect:/";
    }
}
