package pit.pet.Account.Controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import pit.pet.Account.Repository.DogKeyword1Repository;
import pit.pet.Account.Repository.SpeciesRepository;
import pit.pet.Account.Repository.UserRepository;
import pit.pet.Account.Repository.DogRepository;
import pit.pet.Account.Request.DogRegisterRequest;
import pit.pet.Account.Service.DogService;
import pit.pet.Account.User.DogSize;
import pit.pet.Account.User.Dog;
import pit.pet.Account.User.User;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@Controller
@RequiredArgsConstructor
@RequestMapping("/dog")
public class DogController {

    private final DogService dogService;
    private final SpeciesRepository speciesRepository;
    private final DogKeyword1Repository keyword1Repository;
    private final UserRepository userRepository;
    private final DogRepository dogRepository;

    @GetMapping("/register")
    public String showDogRegisterForm(Model model) {
        model.addAttribute("dogRegisterRequest", new DogRegisterRequest());
        model.addAttribute("speciesList", speciesRepository.findAll());
        model.addAttribute("keyword1List", keyword1Repository.findAll());
        return "Dog/DogRegister";
    }

    @PostMapping("/register")
    public String registerDog(@ModelAttribute DogRegisterRequest request, Principal principal) {
        Long userId = getUserIdFromPrincipal(principal);
        dogService.registerDog(request, userId);
        return "redirect:/";
    }

    // 강아지 상태 업데이트 API
    @PostMapping("/update-status")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateDogStatus(
            @RequestParam Long dogId,
            @RequestParam String status,
            @AuthenticationPrincipal UserDetails principal) {

        Map<String, Object> response = new HashMap<>();

        try {
            if (principal == null) {
                response.put("success", false);
                response.put("message", "로그인이 필요합니다.");
                return ResponseEntity.ok(response);
            }

            User user = userRepository.findByUemail(principal.getUsername())
                    .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

            Dog dog = dogRepository.findById(dogId)
                    .orElseThrow(() -> new RuntimeException("강아지를 찾을 수 없습니다."));

            // 본인의 강아지인지 확인
            if (!dog.getOwner().getUno().equals(user.getUno())) {
                response.put("success", false);
                response.put("message", "권한이 없습니다.");
                return ResponseEntity.ok(response);
            }

            // 상태 업데이트
            dog.setStatus(status);
            dogRepository.save(dog);

            response.put("success", true);
            response.put("message", "상태가 업데이트되었습니다.");
            response.put("dogId", dogId);
            response.put("newStatus", status);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
    }

    private Long getUserIdFromPrincipal(Principal principal) {
        String email = principal.getName();
        return userRepository.findByUemail(email)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."))
                .getUno();
    }
}