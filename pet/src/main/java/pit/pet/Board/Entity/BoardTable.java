
package pit.pet.Board.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import pit.pet.Account.User.Dog;
import pit.pet.Group.entity.GroupTable;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "boardTable")
public class BoardTable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "bno")
    private Long bno;

    @Column(name = "b_content", columnDefinition = "TEXT")
    private String bcontent;

    @Column(name = "b_nowtime")
    private LocalDateTime bnowtime;

    // ✅ 게시글 - 그룹 (N:1)
    @ManyToOne
    @JoinColumn(name = "gno", nullable = false)
    @JsonIgnore
    private GroupTable group;


    // ✅ 게시자 이름 연결에 대한 제안
//    @Column(name = "b_writer_name")
//    private String bWriterName;

    // 또는 아래와 같이 Dog 또는 GroupMember 연결도 가능:
    @ManyToOne
    @JoinColumn(name = "dno")
    private Dog writerdog;

    @OneToMany(mappedBy = "board", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<BoardImgTable> images = new ArrayList<>();

    @OneToMany(mappedBy = "board", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<BoardLikeTable> likes = new ArrayList<>();

    @Column(name = "b_like_count")
    private Integer blikecount = 0; // 기본값 0

    public String getFirstImgName() {
        if (images != null && !images.isEmpty()) {
            return images.get(0).getBiurl();
        }
        return "/img/default.jpg";
    }

    @OneToMany(mappedBy = "board", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<BoardCommentTable> comments = new ArrayList<>();

    public int getCommentCount() {
        return comments != null ? comments.size() : 0;
    }

    public String getBdesc() {
        if (bcontent == null) return "";
        return bcontent.length() > 20 ? bcontent.substring(0, 20) + "..." : bcontent;
    }

}
