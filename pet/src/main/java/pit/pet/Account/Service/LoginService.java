package pit.pet.Account.Service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import pit.pet.Account.Repository.UserRepository;
import pit.pet.Account.Request.LoginRequest;
import pit.pet.Account.User.User;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class LoginService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void login(LoginRequest loginRequest, HttpServletRequest request){
        User user = userRepository.findByUemail(loginRequest.getEmail()).orElseThrow(() -> new BadCredentialsException("이메일 또는 비밀번호가 틀렸습니다."));

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getUpwd())) {
            throw new BadCredentialsException("이메일 또는 비밀번호가 맞지 않습니다.");
        }

        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        HttpSession session = request.getSession();
        session.setMaxInactiveInterval(3600);
        session.setAttribute("loginUser", user);
    }

}
