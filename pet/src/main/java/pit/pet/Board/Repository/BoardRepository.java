package pit.pet.Board.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pit.pet.Account.User.Dog;
import pit.pet.Board.Entity.BoardListTable;
import pit.pet.Board.Entity.BoardTable;
import pit.pet.Group.entity.GroupTable;

import java.util.List;
import java.util.Optional;

public interface BoardRepository extends JpaRepository<BoardTable, Long> {
    // 특정 게시판에 포함된 게시글 목록
    List<BoardTable> findByBoardListTable(BoardListTable boardListTable);


    @Query("SELECT b FROM BoardTable b " +
            "LEFT JOIN FETCH b.writerdog " +
            "LEFT JOIN FETCH b.images " +
            "LEFT JOIN FETCH b.likes " +
            "LEFT JOIN FETCH b.boardListTable " +
            "WHERE b.bno = :bno")
    Optional<BoardTable> findByIdWithAllRelations(@Param("bno") Long bno);

    @Query("SELECT b FROM BoardTable b LEFT JOIN FETCH b.images WHERE b.bno = :bno")
    Optional<BoardTable> findByIdWithImages(@Param("bno") Long bno);
}
