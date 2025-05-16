package pit.pet.Account.User;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "dogcountTable")
public class DogCount {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int dcno;
}
