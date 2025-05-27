package pit.pet.Account.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pit.pet.Account.User.PasswordResetCode;

import java.util.Optional;

public interface PasswordResetCodeRepository extends JpaRepository<PasswordResetCode, Long> {
    Optional<PasswordResetCode> findByEmailAndCode(String email, String code);
    void deleteByEmail(String email);
}
