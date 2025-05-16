package pit.pet.Account.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    boolean existsByumail(String uemail);
    Optional<User> findByUemail(String uemail);
}
