package pit.pet.Board.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pit.pet.Account.User.Dog;
import pit.pet.Board.Entity.BoardCommentTable;
import pit.pet.Board.Entity.BoardTable;

import java.util.List;

public interface BoardCommentRepository extends JpaRepository<BoardCommentTable, Long> {
    List<BoardCommentTable> findByDogIn(List<Dog> dogs);
    List<BoardCommentTable> findByBoard(BoardTable board);
}
