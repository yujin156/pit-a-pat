package pit.pet.Account.User;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Getter
@Setter
@Entity
public class Address {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long ano;

    @Column(name = "city", nullable = false)
    private String city;

    @Column(name = "County", nullable = false)
    private String county;

    @Column(name = "town", nullable = false)
    private String town;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uno")
    @JsonBackReference("user-address")
    private User user;
}