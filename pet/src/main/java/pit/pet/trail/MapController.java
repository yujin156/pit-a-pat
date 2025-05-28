package pit.pet.trail;


import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import pit.pet.Account.Repository.DogRepository;
import pit.pet.Account.Repository.UserRepository;
import pit.pet.Account.User.Dog;
import pit.pet.Account.User.User;

import java.util.List;

@Controller
@RequestMapping("/map")
@RequiredArgsConstructor
public class MapController {
    private final TrailRepository trailRepository;
    private final UserRepository userRepo;
    private final DogRepository dogRepo;
    @GetMapping("/")
    public String trailMap(Model model, @AuthenticationPrincipal UserDetails principal) {
        if (principal != null) {
            User user = userRepo.findByUemail(principal.getUsername())
                    .orElseThrow(() -> new UsernameNotFoundException("유저를 찾을 수 없습니다."));
            List<Dog> myDogs = dogRepo.findByOwner(user);
            model.addAttribute("myDogs", myDogs);  // ✅ 강아지 리스트 전달
        }
        return "trails/map";
    }



}
