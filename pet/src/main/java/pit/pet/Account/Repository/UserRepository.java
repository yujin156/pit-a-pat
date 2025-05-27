package pit.pet.Account.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pit.pet.Account.User.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUemail(String email);
    boolean existsByUemail(String uemail);
    boolean existsByUpno(String upno);
}
