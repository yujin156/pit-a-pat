package pit.pet.Account.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pit.pet.Spec.Species;

import java.util.List;

public interface SpeciesRepository extends JpaRepository<Species, Long> {

    Species findByName(String name);

    @Query("SELECT DISTINCT s.name FROM Species s WHERE s.name LIKE %:keyword%")
    List<String> findSpeciesNamesByKeyword(@Param("keyword") String keyword);
}
