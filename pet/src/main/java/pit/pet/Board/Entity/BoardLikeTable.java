package pit.pet.Board.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import pit.pet.Account.User.Dog;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "boardLikeTable")
public class BoardLikeTable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "blikeno")
    private Long blikeno;

    @ManyToOne
    @JoinColumn(name = "bno", nullable = false)
    private BoardTable board;

    @ManyToOne
    @JoinColumn(name = "dno")  // 또는 User로 변경 가능
    private Dog dog;  // 누가 좋아요 했는지

    @Column(name = "b_like", nullable = false)
    private Boolean blike;
}
