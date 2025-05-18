package pit.pet.Account.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pit.pet.Account.User.Address;

public interface AddressRepository extends JpaRepository<Address, Long> {
}
