package pit.pet.Board.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import pit.pet.Account.User.Dog;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "boardImgTable")
public class BoardImgTable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "bino")
    private Integer bino;

    @ManyToOne
    @JoinColumn(name = "bno", nullable = false)
    private BoardTable board;

    @ManyToOne
    @JoinColumn(name = "dno")
    private Dog dog; // 이미지와 연결된 강아지

    @Column(name = "bi_url", length = 2083)
    private String biurl;

    @Column(name = "bi_title")
    private String bititle;

    @Column(name = "bi_uploaded_at")
    private LocalDateTime biuploadedat;

}
