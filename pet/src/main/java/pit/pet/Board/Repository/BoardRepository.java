package pit.pet.Board.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pit.pet.Account.User.Dog;
import pit.pet.Board.Entity.BoardTable;
import pit.pet.Group.entity.GroupTable;

import java.util.List;
import java.util.Optional;

public interface BoardRepository extends JpaRepository<BoardTable, Long> {
    // 특정 게시판에 포함된 게시글 목록
    List<BoardTable> findByGroup_Gno(Long gno);

    // 특정 게시판에 포함된 최신순 게시글 목록
    List<BoardTable> findByGroupGnoOrderByBnowtimeDesc(Long gno);

    //특정 그룹에 있는 게시글 목록
    List<BoardTable> findByGroup(GroupTable group);
    List<BoardTable> findByWriterdogIn(List<Dog> dogs);
    @Query("SELECT b FROM BoardTable b " +
            "LEFT JOIN FETCH b.writerdog " +
            "LEFT JOIN FETCH b.images " +
            "LEFT JOIN FETCH b.likes "  +
            "WHERE b.bno = :bno")
    Optional<BoardTable> findByIdWithAllRelations(@Param("bno") Long bno);

    @Query("SELECT b FROM BoardTable b LEFT JOIN FETCH b.images WHERE b.bno = :bno")
    Optional<BoardTable> findByIdWithImages(@Param("bno") Long bno);
}