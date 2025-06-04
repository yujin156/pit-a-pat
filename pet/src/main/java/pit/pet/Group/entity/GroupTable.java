package pit.pet.Group.entity;



import jakarta.persistence.*;
import net.minidev.json.annotate.JsonIgnore;
import pit.pet.Group.entity.Keyword;
import lombok.Getter;
import lombok.Setter;
import pit.pet.Account.User.Dog;
import pit.pet.Board.Entity.BoardTable;

import java.time.LocalDateTime;
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

    @Column(name = "g_content") //그룹소개
    private String gcontent;

    @Column(name = "g_img") //그룹 프로필 이미지
    private String gimg;

    @JsonIgnore
    @Column(name = "g_uploaded_at") //그룹 생성 시간
    private LocalDateTime guploadedat;


    @Enumerated(EnumType.STRING)
    @Column(name = "g_keyword")
    private Keyword gkeyword;  // ✅ 반드시 너가 만든 Keyword!

    @OneToMany(mappedBy = "groupTable", cascade = CascadeType.ALL)
    private List<GroupMemberTable> groupMembers = new ArrayList<>();

    @OneToMany(mappedBy = "group", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BoardTable> boards = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "dno", nullable = false)
    private Dog dog;
}