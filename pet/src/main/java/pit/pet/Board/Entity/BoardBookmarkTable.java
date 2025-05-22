package pit.pet.Board.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import pit.pet.Account.User.Dog;

@Entity
@Getter
@Setter
@Table(name = "boardbookmark")
@NoArgsConstructor
public class BoardBookmarkTable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "bbmno")
    private Long bbno;


    @ManyToOne
    @JoinColumn(name = "bno", nullable = false)
    private BoardTable board;

    @ManyToOne
    @JoinColumn(name = "dno", nullable = false)
    private Dog dog;


    @Column(name = "bbm_mark", nullable = false)
    private Boolean bbmmark;
}
