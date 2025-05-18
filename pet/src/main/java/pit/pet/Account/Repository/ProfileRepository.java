package pit.pet.Account.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pit.pet.Account.User.Dog;
import pit.pet.Account.User.Profile;

import java.util.Optional;

public interface ProfileRepository extends JpaRepository<Profile, Long> {
    Optional<Profile> findByDno(Dog dog);
}
