package pit.pet.Board.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pit.pet.Board.Entity.BoardImgTable;
import pit.pet.Board.Entity.BoardTable;

import java.util.List;

public interface BoardImgRepository extends JpaRepository<BoardImgTable, Integer> {
    // 특정 게시글에 등록된 이미지 모두 조회
    List<BoardImgTable> findByBoard(BoardTable board);
}