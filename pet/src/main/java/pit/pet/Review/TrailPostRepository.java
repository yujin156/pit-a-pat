package pit.pet.Review;

import org.springframework.data.jpa.repository.JpaRepository;
import pit.pet.Account.User.Dog;

import java.util.List;

public interface TrailPostRepository extends JpaRepository<TrailPost, Long> {
    List<TrailPost> findByTrail_Id(Long trailId);
    List<TrailPost> findByDog_Dno(Long dogId);
    List<TrailPost> findTop5ByDogOrderByCreatedAtDesc(Dog dog);
}