package pit.pet.Account.User;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "speciesTable")
public class Dogspecies {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int dsno;

    @Column(name = "species", nullable = false)
    private String species;
}
