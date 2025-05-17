package pit.pet.Account.Controller;

import jakarta.validation.Valid;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import pit.pet.Account.Repository.UserRepository;
import pit.pet.Account.Service.UserService;
import pit.pet.Account.User.Address;
import pit.pet.Account.User.User;

@Controller
@RequiredArgsConstructor
@RequestMapping("user")
public class AccountController {

    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final UserRepository userRepository;
    private final UserService userService;

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
    public String login(Model model) {
        return "Account/Login";
    }
}
