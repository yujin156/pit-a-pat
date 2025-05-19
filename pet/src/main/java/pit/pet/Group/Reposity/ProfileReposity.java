package pit.pet.Group.Reposity;

import org.springframework.data.jpa.repository.JpaRepository;
import pit.pet.Group.entity.Profile;

public interface ProfileReposity extends JpaRepository<Profile, Long> {

    // 유저 번호로 프로필 찾기
    Profile findByUserUno(Long uno);

    // 해당 유저가 프로필을 갖고 있는지 여부 확인
    boolean existsByUserUno(Long uno);
}
