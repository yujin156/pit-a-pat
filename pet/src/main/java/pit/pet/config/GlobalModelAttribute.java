package pit.pet.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;
import pit.pet.Account.Repository.DogRepository;
import pit.pet.Account.Repository.UserRepository;
import pit.pet.Account.User.User;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import java.util.Collections;

@ControllerAdvice
public class GlobalModelAttribute {

    @Autowired
    UserRepository userRepository;
    @Autowired
    DogRepository dogRepository;

    @ModelAttribute
    public void addUserInfo(Model model,
                            @AuthenticationPrincipal UserDetails principal) {
        if (principal != null) {
            User me = userRepository.findByUemail(principal.getUsername())
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));
            model.addAttribute("dogs",  dogRepository.findByOwner(me));
            model.addAttribute("uname", me.getUname());
        } else {
            model.addAttribute("dogs",  Collections.emptyList());
            model.addAttribute("uname", "");
        }
    }
}