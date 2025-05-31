package pit.pet.Account.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pit.pet.Account.User.TOSTable;

import java.util.Optional;

public interface TOSTableRepository extends JpaRepository<TOSTable, Long> {

    Optional<TOSTable> findByUser_Uemail(String uemail);

}