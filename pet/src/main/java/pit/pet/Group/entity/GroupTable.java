package pit.pet.Group.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
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

    @Column(name = "g_membercount")
    private Integer gmembercount;

    @Column(name = "g_leader")
    private Long gleader;

    @Column(name = "g_content") //그룹소개
    private String gcontent;

    @Column(name = "g_img") //그룹 프로필 이미지
    private String gimg;

    @Column(name = "g_uploaded_at") //그룹 생성 시간
    private LocalDateTime guploadedat;


    @Enumerated(EnumType.STRING)
    @Column(name = "g_keyword", nullable = false)
    private Keyword gkeyword;

    @OneToMany(mappedBy = "groupTable", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<GroupMemberTable> groupMembers = new ArrayList<>();

    @OneToMany(mappedBy = "group", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BoardTable> boards = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "dno", nullable = false)
    private Dog dog;
}
