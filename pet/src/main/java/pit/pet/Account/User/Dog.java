package pit.pet.Account.User;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
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

    @Column(name = "d_name", nullable = false)
    private String d_name;

    @Enumerated(EnumType.STRING)
    @Column(name = "u_gender", nullable = false)
    private Gender u_gender;

    @Column(name = "d_Bday", nullable = false)
    private Date d_Bday;

    @Column(name = "d_intro", nullable = false)
    private String d_intro;

    @ManyToOne
    private User owner;
}
