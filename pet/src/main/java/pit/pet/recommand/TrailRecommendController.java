package pit.pet.recommand;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pit.pet.Account.Repository.DogRepository;
import pit.pet.Account.Repository.UserRepository;
import pit.pet.Account.User.Address;
import pit.pet.Account.User.Dog;
import pit.pet.Account.User.User;
import pit.pet.trail.TrailDto;
import pit.pet.trail.TrailService;

import java.util.List;
@RestController
@RequiredArgsConstructor
@RequestMapping("/recommend")
public class TrailRecommendController {

    private final UserRepository userRepo;
    private final DogRepository dogRepo;
    private final LambdaService lambdaService;
    private final TrailService trailService;

    @GetMapping("/trail")
    public ResponseEntity<List<TrailDto>> recommendTrail(
            @RequestParam Long dogId,
            @AuthenticationPrincipal UserDetails principal) {

        User user = userRepo.findByUemail(principal.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        Dog dog = dogRepo.findById(dogId)
                .orElseThrow(() -> new IllegalArgumentException("강아지 없음"));

        Address address = user.getAddress();

        RecommendRequestDto dto = new RecommendRequestDto(
                user.getUno(),
                dog.getDno(),
                dog.getSize().name(),
                address.getCity(),     // 시도 코드
                address.getCounty(),   // 시군구 코드
                address.getTown(),     // 읍면동 코드
                23.5,                  // (임시 날씨 데이터)
                false
        );

        List<Long> trailIds = lambdaService.invokeTrailRecommendation(dto);
        List<TrailDto> trails = trailService.getTrailsByIds(trailIds);

        return ResponseEntity.ok(trails);
    }

    @GetMapping("/recommend")
    public ResponseEntity<List<TrailDto>> recommendTrails(
            @RequestParam Long userId,
            @RequestParam Long dogId,
            @RequestParam(required = false, defaultValue = "5") Integer limit
    ) {
        List<TrailDto> result = trailService.recommendByUser(userId, dogId, limit);
        return ResponseEntity.ok(result);
    }


}
