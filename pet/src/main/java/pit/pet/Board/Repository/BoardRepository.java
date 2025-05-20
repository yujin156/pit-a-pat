package pit.pet.Board.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pit.pet.Account.User.Dog;
import pit.pet.Board.Entity.BoardListTable;
import pit.pet.Board.Entity.BoardTable;

import java.util.List;

public interface BoardRepository extends JpaRepository<BoardTable, Integer> {
    // 특정 게시판에 포함된 게시글 목록
    List<BoardTable> findByBoardList(BoardListTable boardList);

    // 특정 강아지가 작성한 게시글
    List<BoardTable> findBywriterdog(Dog dog);
}
