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
import pit.pet.Account.User.DogKeyword1;
import pit.pet.Account.User.DogSize;
import pit.pet.Account.User.Dog;
import pit.pet.Account.User.User;
import pit.pet.Group.entity.Keyword;

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
    @GetMapping("/register/step3")
    public String showDogSizeForm(@RequestParam int currentDogIndex,
                                  @RequestParam int totalDogs,
                                  Model model) {
        model.addAttribute("currentDogIndex", currentDogIndex);
        model.addAttribute("totalDogs", totalDogs);
        return "Register/Register_Step3_DogSize";
    }

    @PostMapping("/register/step2")
    public String handleDogSize(@RequestParam("size") String sizeStr,
                                @RequestParam("currentDogIndex") int currentDogIndex,
                                @RequestParam("totalDogs") int totalDogs) {
        // DogSize Enum으로 변환 (검증용)
        DogSize dogSize = DogSize.valueOf(sizeStr);
        return "redirect:/dog/register/step3?currentDogIndex=" + currentDogIndex
                + "&totalDogs=" + totalDogs
                + "&size=" + dogSize; // 🔥 dogSize → size 이름으로 통일
    }

    // 2️⃣ 강아지 프로필 입력 (Register3)
    @GetMapping("/register/step4")
    public String showDogProfileForm(@RequestParam int currentDogIndex,
                                     @RequestParam int totalDogs,
                                     @RequestParam("size") String size,
                                     @RequestParam(required = false) Long dogId,
                                     Model model) {
        model.addAttribute("dogSize", DogSize.valueOf(size));
        model.addAttribute("speciesList", speciesRepository.findAll());
        model.addAttribute("currentDogIndex", currentDogIndex);
        model.addAttribute("totalDogs", totalDogs);
        model.addAttribute("dogId", dogId);
        return "Register/Register_Step4_DogInfo";
    }

    @PostMapping("/register/step3")
    public String handleDogProfile(@ModelAttribute DogRegisterRequest request,
                                   @RequestParam("dogImage") MultipartFile imageFile,
                                   @RequestParam int currentDogIndex,
                                   @RequestParam int totalDogs,
                                   @RequestParam("size") String size,
                                   HttpSession session) {

        Long userId = (Long) session.getAttribute("userId");
        // 강아지 저장 및 dogId 생성
        request.setSize(size);
        request.setImageFile(imageFile);
        Long dogId = dogService.registerDog(request, userId);

        return "redirect:/dog/register/step4?currentDogIndex=" + currentDogIndex
                + "&totalDogs=" + totalDogs
                + "&size=" + size
                + "&dogId=" + dogId;
    }

    // 3️⃣ 강아지 키워드 선택 (Register4)
    @GetMapping("/register/step5")
    public String showDogKeywordForm(@RequestParam int currentDogIndex,
                                     @RequestParam int totalDogs,
                                     @RequestParam Long dogId,
                                     Model model) {

        List<DogKeyword1> keywords = keyword1Repository.findAll();
        System.out.println("🔍 Step5 키워드 목록: " + keywords.size() + "개");
        for (DogKeyword1 keyword1 : keywords) {
            System.out.println("  👉 " + keyword1.getDktag());
        }

        model.addAttribute("keyword1List", keywords);
        model.addAttribute("dogId", dogId);
        model.addAttribute("currentDogIndex", currentDogIndex);
        model.addAttribute("totalDogs", totalDogs);
        return "Register/Register_Step5_DogKeyword";
    }

    @PostMapping("/register/step4")
    public String handleDogKeyword(@RequestParam("keywordIds") List<Long> keywordIds,
                                   @RequestParam Long dogId,
                                   @RequestParam int currentDogIndex,
                                   @RequestParam int totalDogs) {

        dogService.updateDogKeywordsDirectly(dogId, keywordIds);

        if (currentDogIndex < totalDogs) {
            // 다음 강아지 등록으로 돌아가기
            return "redirect:/dog/register/step2?currentDogIndex=" + (currentDogIndex + 1) + "&totalDogs=" + totalDogs;
        } else {
            // 모든 강아지 등록 완료
            return "redirect:/register/complete";
        }
    }

    // 🔹 강아지 상태 업데이트 API
    @PostMapping("/update-status")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateDogStatus(@RequestParam Long dogId,
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
