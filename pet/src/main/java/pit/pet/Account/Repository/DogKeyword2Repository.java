package pit.pet.Account.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pit.pet.Account.User.DogKeyword2;

public interface DogKeyword2Repository extends JpaRepository<DogKeyword2, Long> {
    DogKeyword2 findByKbtag(String kbtag); // ✅ 이제 정상 작동
}
