package pit.pet.Group.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pit.pet.Group.entity.GroupTable;

public interface GroupRepository extends JpaRepository<GroupTable, Long> {

}