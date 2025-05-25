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
import pit.pet.Account.User.Dog;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

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
            try {
                User me = userRepository.findByUemail(principal.getUsername())
                        .orElseThrow(() -> new UsernameNotFoundException("User not found"));

                // ✅ 오직 로그인한 사용자의 강아지들만 조회
                List<Dog> myOnlyDogs = dogRepository.findByOwner(me);
                List<Map<String, Object>> safeDogs = new ArrayList<>();

                System.out.println("GlobalModelAttribute - 로그인 유저: " + me.getUemail());
                System.out.println("GlobalModelAttribute - 유저 ID: " + me.getUno());

                for (Dog dog : myOnlyDogs) {
                    // ✅ 소유자 검증 추가
                    if (dog.getOwner().getUno().equals(me.getUno())) {
                        Map<String, Object> dogData = new HashMap<>();
                        dogData.put("dno", dog.getDno());
                        dogData.put("dname", dog.getDname());
                        dogData.put("status", dog.getStatus() != null ? dog.getStatus() : "온라인");

                        // 이미지 정보 안전하게 추가
                        if (dog.getImage() != null) {
                            Map<String, Object> imageData = new HashMap<>();
                            imageData.put("diurl", dog.getImage().getDiurl());
                            dogData.put("image", imageData);
                        } else {
                            dogData.put("image", null);
                        }

                        // 견종 정보 안전하게 추가
                        if (dog.getSpecies() != null) {
                            dogData.put("speciesName", dog.getSpecies().getName());
                        }

                        // 성별 정보 안전하게 추가
                        if (dog.getUgender() != null) {
                            dogData.put("genderLabel", dog.getUgender().Doglabel());
                        }

                        safeDogs.add(dogData);
                        System.out.println("GlobalModelAttribute - 내 강아지 추가: " + dog.getDname() + " (소유자: " + dog.getOwner().getUemail() + ")");
                    }
                }

                model.addAttribute("dogs", safeDogs);
                model.addAttribute("uname", me.getUname());

                System.out.println("GlobalModelAttribute - 최종 내 강아지 수: " + safeDogs.size());

            } catch (Exception e) {
                System.err.println("GlobalModelAttribute 오류: " + e.getMessage());
                e.printStackTrace();
                model.addAttribute("dogs", Collections.emptyList());
                model.addAttribute("uname", "");
            }
        } else {
            model.addAttribute("dogs", Collections.emptyList());
            model.addAttribute("uname", "");
        }
    }
}