package pit.pet.trail;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TrailRepository extends JpaRepository<Trail, Long> {
    List<Trail> findByIdIn(List<Long> ids);
    List<Trail> findByNameIn(List<String> names);
}
