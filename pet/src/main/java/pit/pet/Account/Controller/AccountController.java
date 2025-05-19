package pit.pet.Account.Controller;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import pit.pet.Account.Repository.UserRepository;
import pit.pet.Account.Service.UserService;
import pit.pet.Account.User.Address;
import pit.pet.Account.User.User;
import pit.pet.Security.JWT.JwtTokenProvider;
import pit.pet.Account.User.Role;
import java.util.Optional;

@Controller
@RequiredArgsConstructor
@RequestMapping("/user")
public class AccountController {

    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final UserRepository userRepository;
    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;

    @GetMapping("/signup")
    public String showSignupForm(Model model) {
        model.addAttribute("user", new User());
        model.addAttribute("address", new Address());
        return "Account/Register";
    }

    @PostMapping("/signup")
    public String registerUser(@ModelAttribute User user,
                               @ModelAttribute Address address) {
        userService.registerUser(user, address);
        return "redirect:/user/login";
    }

    @GetMapping("/login")
    public String loginForm() {
        return "Account/Login_center";
    }

    @PostMapping("/login")
    public String login(@RequestParam String email,
                        @RequestParam String password,
                        HttpServletResponse response,
                        HttpSession session,
                        Model model) {

        Optional<User> optionalUser = userRepository.findByUemail(email);
        if (optionalUser.isEmpty()) {
            model.addAttribute("error", "이메일 또는 비밀번호가 올바르지 않습니다.");
            return "Account/Login_center";
        }

        User user = optionalUser.get();
        if (!bCryptPasswordEncoder.matches(password, user.getUpwd())) {
            model.addAttribute("error", "이메일 또는 비밀번호가 올바르지 않습니다.");
            return "Account/Login_center";
        }

        // ✅ JWT 발급
        String accessToken = jwtTokenProvider.createAccessToken(user.getUemail(), user.getRole());
        String refreshToken = jwtTokenProvider.createRefreshToken(user.getUemail(), user.getRole());

        // ✅ 쿠키 저장
        Cookie accessCookie = new Cookie("accessToken", accessToken);
        accessCookie.setHttpOnly(true);
        accessCookie.setPath("/");
        accessCookie.setMaxAge(60 * 60);
        response.addCookie(accessCookie);

        Cookie refreshCookie = new Cookie("refreshToken", refreshToken);
        refreshCookie.setHttpOnly(true);
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge(60 * 60 * 24);
        response.addCookie(refreshCookie);

        // ✅ 세션 저장
        session.setAttribute("user", user);
        session.setMaxInactiveInterval(60 * 60 * 24);

        // ✅ 역할별 리다이렉트
        if (user.getRole() == Role.ADMIN) {
            return "redirect:/";
        } else {
            return "redirect:/";
        }
    }



    @GetMapping("/logout")
    public String logout(HttpServletRequest request, HttpServletResponse response) {
        // 1. 세션 무효화
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }

        // 2. 쿠키 삭제 (AccessToken, RefreshToken)
        deleteCookie("accessToken", response);
        deleteCookie("refreshToken", response);

        // 3. 로그아웃 후 이동할 경로
        return "redirect:/";
    }

    private void deleteCookie(String name, HttpServletResponse response) {
        Cookie cookie = new Cookie(name, null);
        cookie.setMaxAge(0);
        cookie.setPath("/");
        response.addCookie(cookie);
    }




}

