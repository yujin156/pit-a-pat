package pit.pet.Account.User;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Getter
@Setter
@Entity
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "uno")
    private Long uno;

    @Column(name = "u_email", nullable = false, unique = true)
    private String uemail;

    @Column(name = "u_pwd", nullable = false)
    private String upwd;

    @Column(name = "u_name", nullable = false)
    private String uname;

    @Enumerated(EnumType.STRING)
    @Column(name = "u_gender", nullable = false)
    private Gender ugender;

    @DateTimeFormat(pattern = "yyyy-MM-dd")
    @Column(name = "u_Bday", nullable = false)
    private Date uBday;

    @Column(name = "u_pno", nullable = false)
    private int upno;

    @Enumerated(EnumType.STRING)
    private Role role;

    // User.java (예시)
    @OneToMany(mappedBy = "owner")
    private List<Dog> dogs = new ArrayList<>();


    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "uno")
    private Address address;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;
}
