package pit.pet.Board.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pit.pet.Account.User.Dog;
import pit.pet.Account.User.User;
import pit.pet.Board.Entity.BoardBookmarkTable;
import pit.pet.Board.Entity.BoardTable;

import java.util.List;
import java.util.Optional;

public interface BoardBookmarkRepository extends JpaRepository<BoardBookmarkTable, Long> {
    Optional<BoardBookmarkTable> findByDogAndBoard(Dog dog, BoardTable board);
    List<BoardBookmarkTable> findByDog(Dog dog);
    List<BoardBookmarkTable> findByBoard(BoardTable board);
}