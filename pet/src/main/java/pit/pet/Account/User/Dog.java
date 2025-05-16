package pit.pet.Account.User;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;


@Getter
@Setter
@Entity
@Table(name = "DogTable")
public class Dog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int dno;

    @Column(name = "d_name", nullable = false, unique = true)
    private String d_name;

    @Enumerated(EnumType.STRING)
    @Column(name = "u_gender", nullable = false)
    private Gender u_gender;

    @Column(name = "d_Bday", nullable = false, unique = true)
    private Date d_Bday;

    @Column(name = "d_intro", nullable = false, unique = true)
    private String d_intro;

    @ManyToOne
    private User owner;
}
