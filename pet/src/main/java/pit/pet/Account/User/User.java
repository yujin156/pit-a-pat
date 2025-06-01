package pit.pet.Account.User;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Getter
@Setter
@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
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
    private String upno; // 🔧 int → String 으로 변경!

    @Enumerated(EnumType.STRING)
    private Role role;

    @OneToMany(mappedBy = "owner", fetch = FetchType.LAZY)
    @JsonManagedReference("user-dogs")
    private List<Dog> dogs = new ArrayList<>();

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "uno")
    @JsonManagedReference("user-address")
    private Address address;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference("user-tosTable")
    private TOSTable tosTable;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;
}