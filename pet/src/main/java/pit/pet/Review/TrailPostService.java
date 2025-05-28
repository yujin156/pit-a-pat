package pit.pet.Review;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import pit.pet.Account.Repository.DogRepository;
import pit.pet.Account.User.Dog;
import pit.pet.trail.Trail;
import pit.pet.trail.TrailRepository;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TrailPostService {


    private final TrailRepository trailRepo;
    private final DogRepository dogRepo;
    private final TrailPostRepository postRepo;

    private String uploadDir = "pet/src/main/resources/static/uploads/trail-posts/";
    public void savePost(Long trailId, Long dogId, String content, int rating, MultipartFile image) {
        Trail trail = trailRepo.findById(trailId).orElseThrow();
        Dog dog = dogRepo.findById(dogId).orElseThrow();

        String filePath = null;
        if (image != null && !image.isEmpty()) {
            try {
                String fileName = UUID.randomUUID() + "_" + image.getOriginalFilename();
                Path savePath = Paths.get(uploadDir + fileName);
                Files.createDirectories(savePath.getParent());
                Files.write(savePath, image.getBytes());
                filePath = "/uploads/trail-posts/" + fileName;
            } catch (IOException e) {
                throw new RuntimeException("이미지 저장 실패", e);
            }
        }

        TrailPost post = new TrailPost();
        post.setTrail(trail);
        post.setDog(dog);
        post.setContent(content);
        post.setRating(rating);  // ⭐ 저장
        post.setImagePath(filePath);
        postRepo.save(post);
    }

    public double getAverageRatingByTrail(Long trailId) {
        List<TrailPost> posts = postRepo.findByTrail_Id(trailId);
        return posts.isEmpty() ? 0.0 :
                posts.stream().mapToInt(TrailPost::getRating).average().orElse(0.0);
    }

    public String formatTimeAgo(LocalDateTime createdAt) {
        Duration duration = Duration.between(createdAt, LocalDateTime.now());
        long hours = duration.toHours();
        return (hours < 24) ? hours + "시간 전" : duration.toDays() + "일 전";
    }
}
