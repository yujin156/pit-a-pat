package pit.pet.Account.User;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class DogKeyword2 {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long dkdno;

    @Column(name = "kb_tag", nullable = false)
    private String kbtag;
}
