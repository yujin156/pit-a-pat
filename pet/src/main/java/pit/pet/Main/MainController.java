package pit.pet.Main;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.ui.Model;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import pit.pet.Account.Repository.DogRepository;
import pit.pet.Account.Repository.UserRepository;
import pit.pet.Account.User.Dog;
import pit.pet.Account.User.User;
import pit.pet.Security.JWT.JwtTokenProvider;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Controller
@RequestMapping("/")
@RequiredArgsConstructor
public class MainController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final DogRepository dogRepository;


    // ────────────────────────────────────────────────────────────
    // 1) 메인 페이지 GET
    //    • Home.html 에 로그인 폼 프래그먼트(Login_center)와 사이드 메뉴( Side_menu )를 포함
    //    • error 가 있을 때 Model 에 담아주면, 뷰에서 에러 메시지 표시
    // ────────────────────────────────────────────────────────────
    @GetMapping({"/", "/login"})
    public String mainPage(
            @RequestParam(value = "error", required = false) String error,
            @AuthenticationPrincipal UserDetails principal,
            Model model
    ) {
        // 1) principal이 null이 아닐 때만
        if (principal != null) {
            // 2) 로그인한 유저 엔티티 조회
            String email = principal.getUsername();
            User me = userRepository.findByUemail(email)
                    .orElseThrow(() ->
                            new UsernameNotFoundException("User not found: " + email));

            // 3) 그 유저의 강아지 리스트만 조회
            List<Dog> myDogs = dogRepository.findByOwner(me);
            model.addAttribute("dogs", myDogs);

            // (선택) 사용자 이름도 넘겨주면 뷰에서 편하게 쓸 수 있습니다
            model.addAttribute("uname", me.getUname());
        } else {
            // 비로그인 상태인 경우 빈 리스트라도 넘겨주면 Thymeleaf 오류 방지
            model.addAttribute("dogs", Collections.emptyList());
        }

        if (error != null) {
            model.addAttribute("error", "이메일 또는 비밀번호가 올바르지 않습니다.");
        }
        return "Home";
    }


    // ────────────────────────────────────────────────────────────
    // 2) 로그인 처리 POST
    //    • 실패 시 다시 Home으로 돌아오면서 ?error 파라미터 삽입
    //    • 성공 시 세션/쿠키 설정 후 메인으로 리다이렉트
    // ────────────────────────────────────────────────────────────
    @PostMapping("login")
    public String login(
            @RequestParam String email,
            @RequestParam String password,
            HttpServletResponse response,
            HttpSession session,
            RedirectAttributes redirectAttrs
    ) {
        Optional<User> optionalUser = userRepository.findByUemail(email);
        if (optionalUser.isEmpty()
                || !bCryptPasswordEncoder.matches(password, optionalUser.get().getUpwd())) {
            redirectAttrs.addAttribute("error", "true");
            return "redirect:/";
        }

        User user = optionalUser.get();
        // JWT 발급
        String accessToken  = jwtTokenProvider.createAccessToken(user.getUemail(), user.getRole());
        String refreshToken = jwtTokenProvider.createRefreshToken(user.getUemail(), user.getRole());

        // 쿠키 저장
        Cookie ac = new Cookie("accessToken", accessToken);
        ac.setHttpOnly(true); ac.setPath("/"); ac.setMaxAge(60*60);
        response.addCookie(ac);

        Cookie rc = new Cookie("refreshToken", refreshToken);
        rc.setHttpOnly(true); rc.setPath("/"); rc.setMaxAge(60*60*24);
        response.addCookie(rc);

        // 세션 저장
        session.setAttribute("user", user);
        session.setMaxInactiveInterval(60*60*24);

        return "redirect:/";
    }

    // ────────────────────────────────────────────────────────────
    // 3) 로그아웃 GET
    //    • 세션 무효화 + 쿠키 삭제 후 메인으로
    // ────────────────────────────────────────────────────────────
    @GetMapping("logout")
    public String logout(HttpServletRequest request,
                         HttpServletResponse response) {
        HttpSession session = request.getSession(false);
        if (session != null) session.invalidate();
        deleteCookie("accessToken", response);
        deleteCookie("refreshToken", response);
        return "redirect:/";
    }

    private void deleteCookie(String name, HttpServletResponse response) {
        Cookie c = new Cookie(name, null);
        c.setPath("/"); c.setMaxAge(0);
        response.addCookie(c);
    }
}