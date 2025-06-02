package pit.pet.Account.Controller;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class RegisterController {
    @GetMapping("/register/complete")
    public String registerComplete(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");

        return "Register/RegisterComplete";
    }
}