package pit.pet.Account.Controller;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
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
import java.util.List;
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

    // 1️⃣ 강아지 크기 선택 (Register2)
    @GetMapping("/register/step2")
    public String showDogSizeForm(@RequestParam int currentDogIndex,
                                  @RequestParam int totalDogs,
                                  Model model) {
        model.addAttribute("currentDogIndex", currentDogIndex);
        model.addAttribute("totalDogs", totalDogs);
        return "Register/Register2";
    }

    @PostMapping("/register/step2")
    public String handleDogSize(@RequestParam("size") String sizeStr, // 여기를 dogSize → size로
                                @RequestParam("currentDogIndex") int currentDogIndex,
                                @RequestParam("totalDogs") int totalDogs) {
        DogSize dogSize = DogSize.valueOf(sizeStr);
        return "redirect:/dog/register/step3?currentDogIndex=" + currentDogIndex
                + "&totalDogs=" + totalDogs
                + "&dogSize=" + dogSize;
    }

    // 2️⃣ 강아지 프로필 입력 (Register3)
    @GetMapping("/register/step3")
    public String showDogProfileForm(@RequestParam int currentDogIndex,
                                     @RequestParam int totalDogs,
                                     @RequestParam String dogSize,
                                     Model model) {
        model.addAttribute("dogSize", DogSize.valueOf(dogSize));
        model.addAttribute("speciesList", speciesRepository.findAll());
        model.addAttribute("currentDogIndex", currentDogIndex);
        model.addAttribute("totalDogs", totalDogs);
        return "Register/Register3";
    }

    @PostMapping("/register/step3")
    public String handleDogProfile(@ModelAttribute DogRegisterRequest request,
                                   @RequestParam int currentDogIndex,
                                   @RequestParam int totalDogs,
                                   @RequestParam("size") String size,
                                   HttpSession session) { // 새로 추가!

        Long userId = (Long) session.getAttribute("userId");  // ⭐ userId 꺼내오기
        request.setSize(size); //
        Long dogId = dogService.registerDog(request, userId);  // ⭐ owner 설정된 강아지 등록


        return "redirect:/dog/register/step4?currentDogIndex=" + currentDogIndex
                + "&totalDogs=" + totalDogs
                + "&dogId=" + dogId;
    }

    // 3️⃣ 강아지 키워드 선택 (Register4)
    @GetMapping("/register/step4")
    public String showDogKeywordForm(@RequestParam int currentDogIndex,
                                     @RequestParam int totalDogs,
                                     @RequestParam Long dogId,
                                     Model model) {  // 🔥 Principal 제거!

        model.addAttribute("keyword1List", keyword1Repository.findAll());
        model.addAttribute("dogId", dogId);
        model.addAttribute("currentDogIndex", currentDogIndex);
        model.addAttribute("totalDogs", totalDogs);

        return "Register/Register4";
    }

    @PostMapping("/register/step4")
    public String handleDogKeyword(@RequestParam("keywordIds") List<Long> keywordIds,
                                   @RequestParam Long dogId,
                                   @RequestParam int currentDogIndex,
                                   @RequestParam int totalDogs) {

        dogService.updateDogKeywordsDirectly(dogId, keywordIds);

        if (currentDogIndex < totalDogs) {
            return "redirect:/dog/register/step2?currentDogIndex=" + (currentDogIndex + 1) + "&totalDogs=" + totalDogs;
        } else {
            return "redirect:/register/complete";
        }
    }

    // 🔹 강아지 상태 업데이트 API
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

            if (!dog.getOwner().getUno().equals(user.getUno())) {
                response.put("success", false);
                response.put("message", "권한이 없습니다.");
                return ResponseEntity.ok(response);
            }

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

    // 🔸 중복 제거한 유저ID 조회 메서드
    private Long getUserIdFromPrincipal(Principal principal) {
        String email = principal.getName();
        return userRepository.findByUemail(email)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."))
                .getUno();
    }
}
