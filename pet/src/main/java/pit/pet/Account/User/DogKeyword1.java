package pit.pet.Account.User;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "DogkeywordTable")
public class DogKeyword1 {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int dkno;

    @Column(name = "k_tag", nullable = false)
    private String k_tag;

}
