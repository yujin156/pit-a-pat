package pit.pet.Group.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import pit.pet.Account.User.Dog;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
public class GroupTable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "gno")
    private Long gno;

    @Column(name = "g_name")
    private String gname;

    @Column(name = "g_info")
    private String ginfo;  // 그룹 설명

    @Column(name = "interest")
    private String interest;  // 관심사

    @Column(name = "g_membercount")
    private Integer gmembercount;

    @Column(name = "g_leader")
    private Long gleader;

    @OneToMany(mappedBy = "groupTable", cascade = CascadeType.ALL)
    private List<GroupMemberTable> groupMembers = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "dno", nullable = false)
    private Dog dog;
}
