package pit.pet.Board.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import pit.pet.Account.User.Dog;

import java.time.LocalDateTime;


@Entity
@Getter
@Setter
@Table(name = "boardCommentTable")
@NoArgsConstructor
public class BoardCommentTable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "bcno")
    private Long bcno;

    @ManyToOne
    @JoinColumn(name = "bno")
    private BoardTable board;

    @ManyToOne
    @JoinColumn(name = "dno", nullable = false)
    private Dog dog;

    @Column(name = "bc_comment", nullable = false)
    private String bccomment;

    @Column(name = "bc_nowdate", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
