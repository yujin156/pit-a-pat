package pit.pet.Account.User;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class Address {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long ano;

    @Column(name = "city", nullable = false)
    private String city;

    @Column(name = "County", nullable = false)
    private String county;

    @Column(name = "town", nullable = false)
    private String town;

    @OneToOne
    @JoinColumn(name = "uno") // 주소 테이블의 uno → 유저 테이블의 uno를 참조
    private User user;
}
