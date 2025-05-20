package pit.pet.Board.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pit.pet.Board.Entity.BoardListTable;
import pit.pet.Group.entity.GroupTable;

import java.util.Optional;

public interface BoardListRepository extends JpaRepository<BoardListTable, Integer> {
    // 그룹 번호로 게시판 찾기
    Optional<BoardListTable> findByGroupTable(GroupTable group);
}
