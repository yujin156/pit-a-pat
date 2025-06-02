package pit.pet.Spec;



import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import pit.pet.Account.User.Dog;

import java.util.List;

@Entity
@Getter
@Setter
public class Species {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @OneToMany(mappedBy = "species", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Dog> dogs;
}
