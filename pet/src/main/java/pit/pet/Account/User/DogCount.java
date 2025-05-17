package pit.pet.Account.User;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class DogCount {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long dcno;
}
