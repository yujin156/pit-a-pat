package pit.pet.Group.Reposity;

import org.springframework.data.jpa.repository.JpaRepository;
import pit.pet.Group.entity.Group;

import java.util.List;

public interface GroupReposity extends JpaRepository<Group, Long> {

    // 특정 프로필이 만든 모든 그룹 불러오기
    List<Group> findByProfilePno(Long pno);
}
