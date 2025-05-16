package pit.pet.Account.User;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "addressTable")
public class Address {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int ano;

    @Column(name = "city", nullable = false)
    private String city;

    @Column(name = "County", nullable = false)
    private String County;

    @Column(name = "town", nullable = false)
    private String town;
}
