package pit.pet.Account.User;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.List;

@Getter
@Setter
@Entity
public class DogKeyword1 {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long dkno;

    @Column(name = "dk_tag", nullable = false)
    private String dktag;

    @ManyToMany(mappedBy = "keywords1", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Dog> dogs;
}