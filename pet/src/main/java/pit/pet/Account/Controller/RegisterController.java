package pit.pet.Account.Controller;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class RegisterController {
    @GetMapping("/register/complete")
    public String registerComplete(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            System.out.println("세션 userId가 null이야!");
        } else {
            System.out.println("세션 userId 확인: " + userId);
        }
        return "Register/RegisterComplete";
    }
}