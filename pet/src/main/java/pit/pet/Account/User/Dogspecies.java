package pit.pet.Account.User;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class Dogspecies {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long dsno;

    @Column(name = "species", nullable = false)
    private String species;
}
