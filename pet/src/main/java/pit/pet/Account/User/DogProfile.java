package pit.pet.Account.User;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.Builder;


@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DogProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "profile_no")
    private Integer profileNo;

    // 대상 강아지
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dno", nullable = false)
    private Dog dog;

    // 프로필을 만든/소유한 유저
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uno", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DogSize size;
}
