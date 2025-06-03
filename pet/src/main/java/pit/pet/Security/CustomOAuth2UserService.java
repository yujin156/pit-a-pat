package pit.pet.Security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import pit.pet.Account.Repository.UserRepository;
import pit.pet.Account.User.Role;
import pit.pet.Account.User.User;

import java.time.LocalDateTime;
import java.util.Optional;


@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {
    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        // 1. DB에서 이미 유저 있으면 불러옴
        Optional<User> userOpt = userRepository.findByUemail(email);
        User user;
        if (userOpt.isPresent()) {
            user = userOpt.get();
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);
        } else {
            // 2. DB insert하지 않고, 임시 User 객체만 만듦 (추가정보 입력 때 insert)
            user = new User();
            user.setUemail(email);
            user.setUname(name != null ? name : "");
            user.setRole(Role.USER);
            user.setLastLogin(LocalDateTime.now());
            // u_bday, u_pno, ugender 등은 아직 null로 둠
        }
        return new CustomOAuth2User(user, oAuth2User.getAttributes());
    }

}
