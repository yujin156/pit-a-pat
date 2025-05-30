package pit.pet.Board.Service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import pit.pet.Board.Entity.BoardImgTable;
import pit.pet.Board.Entity.BoardListTable;
import pit.pet.Board.Entity.BoardTable;
import pit.pet.Board.Repository.BoardImgRepository;
import pit.pet.Board.Repository.BoardListRepository;
import pit.pet.Board.Repository.BoardRepository;
import pit.pet.Board.Request.BoardCreateRequest;
import pit.pet.Board.Request.BoardImgUploadRequest;
import pit.pet.Account.User.Dog;
import pit.pet.Account.Repository.DogRepository;
import pit.pet.Board.Request.BoardUpdateRequest;
import pit.pet.Group.entity.GroupTable;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BoardWriteService {

    private final BoardRepository boardRepository;
    private final BoardImgRepository boardImgRepository;
    private final BoardListRepository boardListRepository;
    private final DogRepository dogRepository;

    @PersistenceContext
    private EntityManager entityManager;

    // ✅ 게시글 작성
    @Transactional
    public BoardTable createPost(BoardCreateRequest request, BoardImgUploadRequest imgRequest) {
        Dog dog = dogRepository.findById(request.getDno())
                .orElseThrow(() -> new IllegalArgumentException("작성자 정보 없음"));

        BoardListTable boardList = boardListRepository.findById(request.getBlno())
                .orElseThrow(() -> new IllegalArgumentException("게시판 카테고리 없음"));

        GroupTable group = boardList.getGroupTable(); // ✅ 게시판에서 그룹을 가져옴

        BoardTable board = new BoardTable();
        board.setBcontent(request.getContent());
        board.setBoardListTable(boardList);
        board.setWriterdog(dog);
        board.setGroup(group); // ✅ 여기가 핵심

        BoardTable savedBoard = boardRepository.save(board);

        // 이미지 처리
        List<MultipartFile> images = imgRequest.getImageFiles();
        if (images != null && !images.isEmpty()) {
            for (MultipartFile image : images) {
                if (image.isEmpty()) continue;

                try {
                    String uploadDir = new File("C:/Users/user1/Desktop/pit-a-pat/pet/src/main/resources/static/img").getAbsolutePath();
                    String filename = UUID.randomUUID() + "_" + image.getOriginalFilename();
                    Path filepath = Paths.get(uploadDir, filename);
                    Files.createDirectories(filepath.getParent());
                    Files.copy(image.getInputStream(), filepath, StandardCopyOption.REPLACE_EXISTING);

                    BoardImgTable img = new BoardImgTable();
                    img.setBoard(savedBoard);
                    img.setBiurl("/img/" + filename);
                    img.setBititle("첨부 이미지");
                    img.setBiuploadedat(LocalDateTime.now());
                    boardImgRepository.save(img);

                    System.out.println("✅ 이미지 저장 성공: " + filepath);
                } catch (Exception e) {
                    e.printStackTrace();
                    throw new RuntimeException("이미지 저장 실패", e);
                }
            }
            boardImgRepository.flush(); // 저장을 DB에 반영
            savedBoard = boardRepository.findById(savedBoard.getBno()).orElseThrow();
        }

        return savedBoard;
    }

    // ✅ 게시글 내용 수정 (작성자 본인인지 확인)
    @Transactional
    public void updateBoard(BoardUpdateRequest request,
                            List<MultipartFile> newImages,
                            List<Integer> deleteImgIds,
                            Long dno) {

        BoardTable board = boardRepository.findById(request.getBno())
                .orElseThrow(() -> new IllegalArgumentException("해당 게시글 없음"));

        if (!board.getWriterdog().getDno().equals(dno)) {
            throw new SecurityException("수정 권한 없음");
        }

        // ✅ 1. 삭제 대상 이미지 제거
        if (deleteImgIds != null && !deleteImgIds.isEmpty()) {
            board.getImages().removeIf(img -> {
                if (deleteImgIds.contains(img.getBino())) {
                    try {
                        String path = "C:/Users/user1/Desktop/pit-a-pat/pet/src/main/resources/static" + img.getBiurl();
                        Files.deleteIfExists(Path.of(path));
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                    return true;
                }
                return false;
            });
        }

        // ✅ 2. 내용 수정
        board.setBcontent(request.getNewContent());

        // ✅ 3. 새 이미지 업로드 추가
        if (newImages != null && !newImages.isEmpty()) {
            for (MultipartFile image : newImages) {
                if (image.isEmpty()) continue;

                try {
                    String uploadDir = "C:/Users/user1/Desktop/pit-a-pat/pet/src/main/resources/static/img";
                    String filename = UUID.randomUUID() + "_" + image.getOriginalFilename();
                    Path filepath = Paths.get(uploadDir, filename);
                    Files.copy(image.getInputStream(), filepath, StandardCopyOption.REPLACE_EXISTING);

                    BoardImgTable img = new BoardImgTable();
                    img.setBoard(board);
                    img.setBiurl("/img/" + filename);
                    img.setBititle("첨부 이미지");
                    img.setBiuploadedat(LocalDateTime.now());

                    board.getImages().add(img);

                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }
    }

    // ✅ 게시글 삭제 (작성자 본인인지 확인)
    @Transactional
    public void deletePost(Long bno, Long dno) {
        BoardTable board = boardRepository.findById(bno)
                .orElseThrow(() -> new IllegalArgumentException("삭제할 게시글 없음"));

        if (!board.getWriterdog().getDno().equals(dno)) {
            throw new SecurityException("삭제 권한이 없습니다.");
        }

        boardRepository.delete(board);
    }

}