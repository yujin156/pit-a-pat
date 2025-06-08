package pit.pet.Group.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pit.pet.Account.User.Dog;
import pit.pet.Group.entity.GroupMemberTable;
import pit.pet.Group.entity.GroupTable;
import pit.pet.Group.entity.MemberStatus;

import java.util.List;
import java.util.Optional;

public interface GroupMemberRepository extends JpaRepository<GroupMemberTable, Long> {
    boolean existsByDog_DnoAndGroupTable_Gno(Long dno, Long gno);

    Optional<GroupMemberTable> findByDogAndGroupTable(Dog dog, GroupTable groupTable);

    List<GroupMemberTable> findByGroupTable_GnoAndState(Long gno, MemberStatus state);

    Optional<GroupMemberTable> findByGroupTableAndDog(GroupTable group, Dog dog);

    List<GroupMemberTable> findByDogIn(List<Dog> dogs);

    List<GroupMemberTable> findByGroupTable_Gno(Long gno);

    // 🔥 새로 추가! 특정 상태의 멤버만
    List<GroupMemberTable> findByDogInAndState(List<Dog> dogs, MemberStatus state);
    Optional<GroupMemberTable> findByGroupTable_GnoAndState(Long gno, String state);
    boolean existsByGroupTableAndDogAndState(GroupTable group, Dog dog, MemberStatus state);


}