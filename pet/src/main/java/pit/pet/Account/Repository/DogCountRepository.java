package pit.pet.Account.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pit.pet.Account.User.DogCount;

public interface DogCountRepository extends JpaRepository<DogCount, Long> {
}
