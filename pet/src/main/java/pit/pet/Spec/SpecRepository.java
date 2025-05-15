package pit.pet.Spec;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SpecRepository extends JpaRepository<Species, Integer> {
    Optional<Species> findByName(String name);
    List<Species> findByNameContainingIgnoreCase(String keyword);
}
