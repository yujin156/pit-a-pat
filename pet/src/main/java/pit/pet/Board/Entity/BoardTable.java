package pit.pet.Board.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import pit.pet.Account.User.Dog;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
public class BoardTable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "bno")
    private Integer bno;

    @ManyToOne
    @JoinColumn(name = "blno")
    private BoardListTable boardList;

    @Column(name = "b_content", columnDefinition = "TEXT")
    private String bcontent;

    @Column(name = "b_nowtime")
    private LocalDateTime bnowtime;

    // ✅ 게시자 이름 연결에 대한 제안
//    @Column(name = "b_writer_name")
//    private String bWriterName;

    // 또는 아래와 같이 Dog 또는 GroupMember 연결도 가능:
     @ManyToOne
     @JoinColumn(name = "dno")
     private Dog writerdog;

    @OneToMany(mappedBy = "board", cascade = CascadeType.ALL)
    private List<BoardImgTable> images;

    @OneToMany(mappedBy = "board", cascade = CascadeType.ALL)
    private List<BoardLikeTable> likes;

    @Column(name = "b_like_count")
    private Integer blikecount = 0; // 기본값 0
}
