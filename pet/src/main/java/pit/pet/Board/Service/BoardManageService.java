package pit.pet.Board.Service;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pit.pet.Account.User.Dog;
import pit.pet.Account.Repository.DogRepository;
import pit.pet.Board.Entity.BoardBookmarkTable;
import pit.pet.Board.Entity.BoardLikeTable;
import pit.pet.Board.Entity.BoardTable;
import pit.pet.Board.Repository.BoardBookmarkRepository;
import pit.pet.Board.Repository.BoardLikeRepository;
import pit.pet.Board.Repository.BoardRepository;
import pit.pet.Group.entity.GroupTable;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BoardManageService {

    private final BoardRepository boardRepository;
    private final DogRepository dogRepository;
    private final BoardLikeRepository likeRepository;
    private final BoardBookmarkRepository bookmarkRepository;


    @Transactional(readOnly = true)
    public List<BoardTable> getPostsByGroup(Long gno) {
        return boardRepository.findByGroup_Gno(gno);
    }

    // ✅ 좋아요 토글
    @Transactional
    public boolean toggleLike(Long bno, Long dno) {
        BoardTable board = boardRepository.findById(bno)
                .orElseThrow(() -> new IllegalArgumentException("게시글 없음"));
        Dog dog = dogRepository.findById(dno)
                .orElseThrow(() -> new IllegalArgumentException("강아지 없음"));

        return likeRepository.findByDogAndBoard(dog, board)
                .map(like -> {
                    likeRepository.delete(like);
                    board.setBlikecount(board.getBlikecount() - 1);
                    return false; // 좋아요 취소됨
                })
                .orElseGet(() -> {
                    BoardLikeTable newLike = new BoardLikeTable();
                    newLike.setBoard(board);
                    newLike.setDog(dog);
                    newLike.setBlike(true); // ERD에 있으므로 유지하되, 이 필드는 현재 로직에서 사용되지 않습니다.
                    likeRepository.save(newLike);
                    board.setBlikecount(board.getBlikecount() + 1);
                    return true; // 좋아요 등록됨
                });
    }

    // ✅ 북마크 토글
    @Transactional
    public boolean toggleBookmark(Long bno, Long dno) {
        BoardTable board = boardRepository.findById(bno)
                .orElseThrow(() -> new IllegalArgumentException("게시글 없음"));
        Dog dog = dogRepository.findById(dno)
                .orElseThrow(() -> new IllegalArgumentException("강아지 없음"));

        return bookmarkRepository.findByDogAndBoard(dog, board)
                .map(bookmark -> {
                    bookmarkRepository.delete(bookmark);
                    return false; // 북마크 취소됨
                })
                .orElseGet(() -> {
                    BoardBookmarkTable newBookmark = new BoardBookmarkTable();
                    newBookmark.setBoard(board);
                    newBookmark.setDog(dog);
                    newBookmark.setBbmmark(true); // ERD에 있으므로 유지하되, 이 필드는 현재 로직에서 사용되지 않습니다.
                    bookmarkRepository.save(newBookmark);
                    return true; // 북마크 등록됨
                });
    }

    public List<BoardTable> getBoardListByGroup(GroupTable group) {
        return boardRepository.findByGroup(group);
    }

    @Transactional
    public BoardTable findByIdWithAllRelations(Long bno) {
        return boardRepository.findById(bno)
                .orElseThrow(() -> new IllegalArgumentException("해당 게시글이 존재하지 않습니다."));
    }

    // ✅ 좋아요 여부 확인 (게시글 상세 페이지 로드 시 사용)
    public boolean isBoardLiked(Long bno, Long dno) {
        BoardTable board = boardRepository.findById(bno)
                .orElseThrow(() -> new IllegalArgumentException("게시글 없음"));
        Dog dog = dogRepository.findById(dno)
                .orElseThrow(() -> new IllegalArgumentException("강아지 없음"));
        return likeRepository.findByDogAndBoard(dog, board).isPresent();
    }

    // ✅ 북마크 여부 확인 (게시글 상세 페이지 로드 시 사용)
    public boolean isBoardBookmarked(Long bno, Long dno) {
        BoardTable board = boardRepository.findById(bno)
                .orElseThrow(() -> new IllegalArgumentException("게시글 없음"));
        Dog dog = dogRepository.findById(dno)
                .orElseThrow(() -> new IllegalArgumentException("강아지 없음"));
        return bookmarkRepository.findByDogAndBoard(dog, board).isPresent();
    }
}