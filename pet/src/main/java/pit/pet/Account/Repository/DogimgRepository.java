package pit.pet.Account.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pit.pet.Account.User.Dog;
import pit.pet.Account.User.Dogimg;

public interface DogimgRepository extends JpaRepository<Dogimg, Long> {
    Dogimg findByDog(Dog dog);
}
