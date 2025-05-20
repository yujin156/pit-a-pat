package pit.pet.Group.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pit.pet.Account.User.Dog;
import pit.pet.Group.entity.GroupMemberTable;
import pit.pet.Group.entity.GroupTable;
import pit.pet.Group.entity.MemberStatus;

import java.util.List;
import java.util.Optional;

public interface GroupMemberRepository extends JpaRepository<GroupMemberTable, Long> {
    List<GroupMemberTable> findByGroupTable(GroupTable groupTable);

    Optional<GroupMemberTable> findByDogAndGroupTable(Dog dog, GroupTable groupTable);

    List<GroupMemberTable> findByGroupTable_GnoAndState(Long gno, MemberStatus state);

    Optional<GroupMemberTable> findByGroupTableAndDog(GroupTable group, Dog dog);

    List<GroupMemberTable> findByDogIn(List<Dog> dogs);
}
