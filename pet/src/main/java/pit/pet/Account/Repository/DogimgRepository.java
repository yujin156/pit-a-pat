package pit.pet.Account.Repository;


import org.springframework.data.jpa.repository.JpaRepository;
import pit.pet.Account.User.Dog;
import pit.pet.Account.User.Dogimg;

import java.util.Optional;

public interface DogimgRepository extends JpaRepository<Dogimg, Integer> {

    // 특정 강아지에 연결된 이미지 찾기 (1:1 관계)
    Optional<Dogimg> findByDog(Dog dog);

    // 강아지 dno 기준으로 찾기 (Dog 없이 dno로 직접)
    Optional<Dogimg> findByDog_Dno(int dno);
}