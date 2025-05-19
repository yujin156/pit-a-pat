package pit.pet.Group.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "groupTable")
public class Group {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "gno")
    private Long gno;

    @Column(name = "g_name", nullable = false)
    private String gname;

    @Column(name = "g_membercount", nullable = false)
    private int gmembercount;

    @ManyToOne
    @JoinColumn(name = "pno")  // 프로필의 기본키를 외래키로 설정
    private Profile profile;
}
