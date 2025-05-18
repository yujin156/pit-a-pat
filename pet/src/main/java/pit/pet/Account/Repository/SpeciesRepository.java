package pit.pet.Account.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pit.pet.Spec.Species;

public interface SpeciesRepository extends JpaRepository<Species, Long> {
    Species findByName(String name);
}
