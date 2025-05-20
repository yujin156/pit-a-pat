package pit.pet.Group.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
public class GroupTable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long gno; // 그룹 번호 (PK)

    private String gname; // 그룹 이름

    private Integer g_membercount; // 그룹 총 인원

    private Long g_leader; // 리더(생성자)의 그룹멤버 번호

    @OneToMany(mappedBy = "groupTable", cascade = CascadeType.ALL)
    private List<GroupMemberTable> groupMembers = new ArrayList<>();
}
