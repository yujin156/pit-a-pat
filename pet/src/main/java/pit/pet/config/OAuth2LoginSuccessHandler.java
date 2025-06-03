package pit.pet.config;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import pit.pet.Security.CustomOAuth2User;
import pit.pet.Security.JWT.JwtTokenProvider;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        // CustomOAuth2User에서 email/role 추출
        CustomOAuth2User oAuth2User = (CustomOAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getUser().getUemail();
        String role = oAuth2User.getUser().getRole().name();

        // JWT 생성
        String accessToken = jwtTokenProvider.createAccessToken(email, oAuth2User.getUser().getRole());
        String refreshToken = jwtTokenProvider.createRefreshToken(email, oAuth2User.getUser().getRole());


        // 쿠키 저장
        Cookie ac = new Cookie("accessToken", accessToken);
        ac.setHttpOnly(true); ac.setPath("/"); ac.setMaxAge(60*60);
        response.addCookie(ac);

        Cookie rc = new Cookie("refreshToken", refreshToken);
        rc.setHttpOnly(true); rc.setPath("/"); rc.setMaxAge(60*60*24);
        response.addCookie(rc);

        // 메인 페이지로 리다이렉트
        response.sendRedirect("/");
    }
}
