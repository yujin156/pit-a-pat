package pit.pet.Account.Controller;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import pit.pet.Account.Repository.DogKeyword1Repository;
import pit.pet.Account.Repository.DogKeyword2Repository;
import pit.pet.Account.Repository.SpeciesRepository;
import pit.pet.Account.Repository.UserRepository;
import pit.pet.Account.Request.DogRegisterRequest;
import pit.pet.Account.Service.DogService;

import java.security.Principal;

// DogController.java
// DogController.java
@Controller
@RequiredArgsConstructor
@RequestMapping("/dog")
public class DogController {

    private final DogService dogService;
    private final SpeciesRepository speciesRepository;
    private final DogKeyword1Repository keyword1Repository;
    private final DogKeyword2Repository keyword2Repository;
    private final UserRepository userRepository;

    @GetMapping("/register")
    public String showDogRegisterForm(Model model) {
        model.addAttribute("dogRegisterRequest", new DogRegisterRequest());
        model.addAttribute("speciesList", speciesRepository.findAll());
        model.addAttribute("keyword1List", keyword1Repository.findAll());
        model.addAttribute("keyword2List", keyword2Repository.findAll());
        return "Dog/DogRegister";
    }

    @PostMapping("/register")
    public String registerDog(@ModelAttribute DogRegisterRequest request, Principal principal) {
        Long userId = getUserIdFromPrincipal(principal);
        dogService.registerDog(request, userId);
        return "redirect:/";
    }

    private Long getUserIdFromPrincipal(Principal principal) {
        String email = principal.getName();
        return userRepository.findByUemail(email)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."))
                .getUno();
    }
}