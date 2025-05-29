package pit.pet.Group.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pit.pet.Group.entity.GroupTable;

import java.util.Optional;

public interface GroupRepository extends JpaRepository<GroupTable, Long> {
    Optional<GroupTable> findById(Long gno);
}