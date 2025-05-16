package pit.pet.Account.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pit.pet.Account.User.Dog;
import pit.pet.Account.User.Gender;
import pit.pet.Account.User.User;

import java.util.Date;
import java.util.List;
import java.util.Optional;

public interface DogRepository extends JpaRepository<Dog, Integer> {
    // 이름으로 조회
    Optional<Dog> findByD_name(String d_name);

    // 유저별 강아지 목록
    List<Dog> findByOwner(User owner);

    // 성별로 필터링 (예: 수컷만 조회)
    List<Dog> findByUGender(Gender gender);

    // 생일로 조회
    Optional<Dog> findByDBday(Date d_Bday);
}
