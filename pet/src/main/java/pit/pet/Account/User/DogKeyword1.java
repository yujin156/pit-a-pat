package pit.pet.Account.User;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class DogKeyword1 {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long dkno;

    @Column(name = "dk_tag", nullable = false)
    private String dktag;

}
