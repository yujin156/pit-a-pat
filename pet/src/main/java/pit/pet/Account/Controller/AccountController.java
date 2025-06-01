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
import pit.pet.Account.Repository.TOSTableRepository;
import pit.pet.Account.Repository.UserRepository;
import pit.pet.Account.Service.UserService;
import pit.pet.Account.User.Address;
import pit.pet.Account.User.TOSTable;
import pit.pet.Account.User.User;
import pit.pet.Security.JWT.JwtTokenProvider;
import pit.pet.Account.User.Role;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Controller
@RequiredArgsConstructor
@RequestMapping("/user")
public class AccountController {

    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final UserRepository userRepository;
    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;
    private final TOSTableRepository tosTableRepository;

    @GetMapping("/register")
    public String showRegisterForm() {
        return "Register/Register_Form";  // Register 폴더 안의 Register_Form.html
    }

    // ✅ Step1 - 약관동의 저장 후 회원정보 입력창으로 이동
    @PostMapping("/consent")
    public String saveConsent(@RequestParam("privacyAgree") Boolean privacyAgree,
                              @RequestParam(value = "marketingAgree", required = false) Boolean marketingAgree) {

        TOSTable tosTable = new TOSTable();
        tosTable.setPrivacyAgree(privacyAgree);
        tosTable.setMarketingAgree(marketingAgree);

        tosTableRepository.save(tosTable);

        // 동의서 저장 후 회원정보 입력창으로 리다이렉트
        return "redirect:/user/signup";
    }

    // ✅ Step2 - 회원가입 입력창
    @GetMapping("/register/step2")
    public String showSignupForm(Model model) {
        User user = new User();
        user.setAddress(new Address());
        model.addAttribute("user", user);
        return "Register/Register_Step2_UserInfo"; // 회원정보 입력창
    }

    // ✅ Step2 - 회원가입 처리
    @PostMapping("/signup")
    public String registerUser(@ModelAttribute("user") User user,
                               @RequestParam("dogCount") int dogCount,
                               @RequestParam("privacyAgree") Boolean privacyAgree,
                               @RequestParam(value = "marketingAgree", required = false) Boolean marketingAgree,
                               HttpSession session,
                               HttpServletResponse response) {
        System.out.println(dogCount);

        // ✅ TOSTable 인스턴스 생성 및 동의서 정보 세팅
        TOSTable tosTable = new TOSTable();
        tosTable.setPrivacyAgree(privacyAgree);
        tosTable.setMarketingAgree(marketingAgree);
        tosTable.setAssent(privacyAgree);

        // 기본권한 설정 및 비밀번호 암호화
        user.setUpwd(bCryptPasswordEncoder.encode(user.getUpwd()));
        user.setRole(Role.USER);

        // 회원가입 DB 저장 (Address와 함께 저장)
        Long userId = userService.registerUser(user, user.getAddress(), tosTable);

        // JWT 토큰 발급 및 쿠키/세션 저장
        Optional<User> optionalUser = userRepository.findById(userId);
        if (optionalUser.isPresent()) {
            User savedUser = optionalUser.get();

            String accessToken = jwtTokenProvider.createAccessToken(savedUser.getUemail(), savedUser.getRole());
            String refreshToken = jwtTokenProvider.createRefreshToken(savedUser.getUemail(), savedUser.getRole());

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

            session.setAttribute("user", savedUser);
            session.setAttribute("userId", userId);
            session.setMaxInactiveInterval(60 * 60 * 24);
        }

        // 다음 단계: 강아지 등록으로 리다이렉트
        return "redirect:/dog/register/step3?currentDogIndex=1&totalDogs=" + dogCount;
    }


    @GetMapping("/check-email")
    @ResponseBody
    public Map<String, Object> checkEmailDuplicate(@RequestParam String email) {
        boolean exists = userService.existsByEmail(email);
        Map<String, Object> response = new HashMap<>();
        response.put("exists", exists);
        response.put("message", exists ? "이미 사용중인 이메일입니다." : "사용 가능한 이메일입니다.");
        return response;
    }

    //  전화번호 중복확인용 매핑
    @GetMapping("/check-phone")
    @ResponseBody
    public Map<String, Object> checkPhoneDuplicate(@RequestParam String phone) {
        boolean exists = userService.existsByPhone(phone);
        Map<String, Object> response = new HashMap<>();
        response.put("exists", exists);
        response.put("message", exists ? "이미 사용중인 번호입니다." : "사용 가능한 번호입니다.");
        return response;
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


    @GetMapping("/mypage")
    public String mypage(Model model,
                         @AuthenticationPrincipal CustomUserDetails principal) {

        // 로그인한 사용자 정보 가져오기
        User user = userRepository.findByUemail(principal.getUsername())
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));

        // 모델에 사용자 정보와 강아지 목록 추가
        model.addAttribute("user", user);
        model.addAttribute("dogList", dogService.getDogsByUser(user.getUno()));

        return "Mypage"; // 템플릿 경로 맞게 수정 (ex: templates/Account/mypage.html)
    }

    @PostMapping(value = "/mypage/dog/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseBody
    public ResponseEntity<String> registerDogFromMyPage(
            @RequestPart("dog") String dogJson,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile,
            @AuthenticationPrincipal CustomUserDetails principal) {

        try {
            DogRegisterRequest request = objectMapper.readValue(dogJson, DogRegisterRequest.class);
            request.setImageFile(imageFile);

            Long userId = userRepository.findByUemail(principal.getUsername())
                    .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."))
                    .getUno();

            Long dogId = dogService.registerDog(request, userId);

            if (request.getKeyword1Ids() != null && !request.getKeyword1Ids().isEmpty()) {
                dogService.updateDogKeywordsDirectly(dogId, request.getKeyword1Ids());
            }

            return ResponseEntity.ok("강아지 등록 완료");

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("등록 실패: " + e.getMessage());
        }
    }


    private void deleteCookie(String name, HttpServletResponse response) {
        Cookie cookie = new Cookie(name, null);
        cookie.setMaxAge(0);
        cookie.setPath("/");
        response.addCookie(cookie);
    }




}

