package pit.pet.Account.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pit.pet.Account.User.DogProfile;
import pit.pet.Account.User.User;
import pit.pet.Account.User.Dog;

import java.util.List;

public interface DogProfileRepository extends JpaRepository<DogProfile, Integer> {
    List<DogProfile> findByDog(Dog dog);
    List<DogProfile> findByUser(User user);
}
