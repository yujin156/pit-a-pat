package pit.pet.Group.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import pit.pet.Account.User.Dog;

@Entity
@Getter
@Setter
public class GroupMemberTable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long gmno; // 그룹멤버 번호 (PK)

    @ManyToOne
    @JoinColumn(name = "gno")
    private GroupTable groupTable; // 그룹 번호 (FK)

    @ManyToOne
    @JoinColumn(name = "dno")
    private Dog dog; // 강아지 번호 (FK)

    @Enumerated(EnumType.STRING)
    private MemberStatus state = MemberStatus.WAIT; // 가입 상태

}
