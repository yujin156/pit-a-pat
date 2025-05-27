package pit.pet.Board.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pit.pet.Account.User.Dog;
import pit.pet.Board.Entity.BoardLikeTable;
import pit.pet.Board.Entity.BoardTable;

import java.util.Optional;

public interface BoardLikeRepository extends JpaRepository<BoardLikeTable, Long> {
    Optional<BoardLikeTable> findByDogAndBoard(Dog dog, BoardTable board);
}
