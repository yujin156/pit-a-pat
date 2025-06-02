package pit.pet.Review;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import pit.pet.Account.Repository.DogRepository;
import pit.pet.Account.Service.CustomUserDetails;
import pit.pet.Account.User.Dog;
import pit.pet.trail.Trail;
import pit.pet.trail.TrailRepository;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ReviewPageController {

    private final TrailPostService trailPostService;

    @PostMapping("trail-posts")
    public ResponseEntity<String> upload(
            @RequestParam("trailId") Long trailId,
            @RequestParam("dogId") Long dogId,
            @RequestParam("content") String content,
            @RequestParam("rating") int rating,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) {
        trailPostService.savePost(trailId, dogId, content, rating, image);
        return ResponseEntity.ok("등록 완료");
    }

}
