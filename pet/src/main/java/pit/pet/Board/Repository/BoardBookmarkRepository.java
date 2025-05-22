package pit.pet.Board.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pit.pet.Account.User.Dog;
import pit.pet.Account.User.User;
import pit.pet.Board.Entity.BoardBookmarkTable;
import pit.pet.Board.Entity.BoardTable;

import java.util.List;
import java.util.Optional;

public interface BoardBookmarkRepository extends JpaRepository<BoardBookmarkTable, Long> {
    // 특정 유저가 특정 게시글을 북마크했는지 확인
    Optional<BoardBookmarkTable> findByDogAndBoard(Dog dog, BoardTable board);

    // 특정 유저의 모든 북마크 조회
    List<BoardBookmarkTable> findByDog(Dog dog);

    // 게시글 기준 모든 북마크 조회
    List<BoardBookmarkTable> findByBoard(BoardTable board);

}
