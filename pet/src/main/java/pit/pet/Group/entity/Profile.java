package pit.pet.Group.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import pit.pet.Account.User.User;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
public class Profile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pno")
    private Long pno;

    @ManyToOne
    @JoinColumn(name = "uno")
    private User user;

    @OneToMany(mappedBy = "profile")
    private List<Group> groups = new ArrayList<>();
}
