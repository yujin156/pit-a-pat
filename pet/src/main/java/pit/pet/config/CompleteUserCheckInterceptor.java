package pit.pet.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import pit.pet.Account.Repository.UserRepository;
import pit.pet.Account.Service.CustomUserDetails;
import pit.pet.Account.User.User;
import pit.pet.Security.CustomOAuth2User;
import java.io.IOException;


@Component
public class CompleteUserCheckInterceptor implements HandlerInterceptor {
    @Autowired UserRepository userRepository;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws IOException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            Object principalObj = auth.getPrincipal();
            if (principalObj instanceof CustomUserDetails principal) {
                User me = userRepository.findByUemail(principal.getUsername()).orElse(null);
                if (me == null || !me.isCompleted()) {
                    System.out.println("미완성 로컬 유저, 추가정보 입력으로 이동!");
                    response.sendRedirect("/user/missing-info");
                    return false;
                }
            } else if (principalObj instanceof CustomOAuth2User oAuth2User) {
                User me = oAuth2User.getUser();
                if (me == null || !me.isCompleted()) {
                    System.out.println("미완성 구글유저, 추가정보 입력으로 이동!");
                    response.sendRedirect("/user/missing-info");
                    return false;
                }
            }
        }
        System.out.println("preHandle 진입!");
        return true;
    }
}
