//package pit.pet.Board.Entity;
//
//import jakarta.persistence.*;
//import lombok.Getter;
//import lombok.Setter;
//import pit.pet.Group.entity.GroupTable;
//
//import java.util.List;
//
//@Entity
//@Getter
//@Setter
//@Table(name = "boardListTable")
//public class BoardListTable {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    @Column(name = "blno")
//    private Long blno;
//
//    @OneToOne
//    @JoinColumn(name = "gno", nullable = false)
//    private GroupTable groupTable;
//
//    @Column(name = "bl_content", length = 25, nullable = false)
//    private String blContent;
//
//    @OneToMany(mappedBy = "boardListTable") // ✅ boardListTable로 수정
//    private List<BoardTable> boardList;
//}
