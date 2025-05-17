package pit.pet.Account.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pit.pet.Account.User.DogKeyword1;


public interface DogKeyword1Repository extends JpaRepository<DogKeyword1, Long> {
    DogKeyword1 findByKtag(String ktag); // ✔ 필드명과 정확히 일치해야 함!
}