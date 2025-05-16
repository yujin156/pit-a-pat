package pit.pet.Account.Controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import pit.pet.Account.Repository.UserRepository;
import pit.pet.Account.Request.LoginRequest;
import pit.pet.Account.Service.LoginService;

@Controller
@RequiredArgsConstructor
public class LoginController {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final LoginService loginService;

    @GetMapping("/login")
    public String loginForm(Model m) {
        m.addAttribute("LoginRequest",new LoginRequest());
        return "login";
    }

    @PostMapping("/login")
    public String login(@Valid @ModelAttribute LoginRequest loginRequest,
                        BindingResult bindingResult,
                        javax.servlet.http.HttpServletRequest request,
                        Model model) {

        // 유효성 검사 실패 시
        if (bindingResult.hasErrors()) {
            return "login"; // 다시 로그인 폼으로
        }

        try {
            loginService.login(loginRequest, request); // 세션 저장까지 처리됨
            return "redirect:/main"; // 로그인 성공 후 리다이렉트
        } catch (Exception e) {
            model.addAttribute("loginError", e.getMessage());
            return "login";
        }
    }

    @GetMapping("/logout")
    public String logout(HttpServletRequest request) {
        request.getSession().invalidate();
        return "redirect:/login";
    }
}
