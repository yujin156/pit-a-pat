
package pit.pet.Board.Service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import pit.pet.Board.Entity.BoardImgTable;
import pit.pet.Board.Entity.BoardTable;
import pit.pet.Board.Repository.BoardImgRepository;
import pit.pet.Board.Repository.BoardRepository;
import pit.pet.Board.Request.BoardCreateRequest;
import pit.pet.Board.Request.BoardImgUploadRequest;
import pit.pet.Account.User.Dog;
import pit.pet.Account.Repository.DogRepository;
import pit.pet.Board.Request.BoardUpdateRequest;
import pit.pet.Group.Repository.GroupRepository;
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
    private final DogRepository dogRepository;
    private final GroupRepository groupRepository; // ✅ 그룹 리포지토리로 대체

    private final String uploadDir = new File("pet/src/main/resources/static/uploads/img").getAbsolutePath();

    @PersistenceContext
    private EntityManager entityManager;

    // ✅ 게시글 작성
    @Transactional
    public BoardTable createPost(BoardCreateRequest request, BoardImgUploadRequest imgRequest) {
        Dog dog = dogRepository.findById(request.getDno())
                .orElseThrow(() -> new IllegalArgumentException("작성자 정보 없음"));
        GroupTable group = groupRepository.findById(request.getGno())
                .orElseThrow(() -> new IllegalArgumentException("그룹 정보 없음"));

        BoardTable board = new BoardTable();
        board.setBcontent(request.getContent());
        board.setWriterdog(dog);
        board.setGroup(group);

        BoardTable savedBoard = boardRepository.save(board);

        List<MultipartFile> images = imgRequest.getImageFiles();
        if (images != null && !images.isEmpty()) {
            for (MultipartFile image : images) {
                if (image.isEmpty()) continue;

                try {
                    // 파일명 랜덤으로 생성
                    String fileName = UUID.randomUUID() + "_" + image.getOriginalFilename();
                    Path savePath = Paths.get(uploadDir, fileName);

                    // 디렉토리 없으면 생성
                    Files.createDirectories(savePath.getParent());

                    // 파일 복사
                    Files.copy(image.getInputStream(), savePath, StandardCopyOption.REPLACE_EXISTING);

                    // DB에는 웹에서 접근 가능한 경로로 저장!
                    BoardImgTable img = new BoardImgTable();
                    img.setBoard(savedBoard);
                    img.setBiurl("/uploads/img/" + fileName); // ✅ 웹 URL만 저장!
                    img.setBititle("첨부 이미지");
                    img.setBiuploadedat(LocalDateTime.now());
                    boardImgRepository.save(img);
                    System.out.println("💡 uploadDir = " + uploadDir);
                    System.out.println("✅ 이미지 저장 성공: " + img.getBiurl());
                } catch (Exception e) {
                    e.printStackTrace();
                    throw new RuntimeException("이미지 저장 실패", e);
                }
            }
            boardImgRepository.flush();
        }

        return savedBoard;
    }

    // ✅ 게시글 내용 수정
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

        // ✅ 삭제 대상 이미지 제거
        if (deleteImgIds != null && !deleteImgIds.isEmpty()) {
            board.getImages().removeIf(img -> {
                if (deleteImgIds.contains(img.getBino())) {
                    try {
                        String realPath = new File("src/main/resources/static" + img.getBiurl()).getAbsolutePath();
                        Files.deleteIfExists(Path.of(realPath));
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                    return true;
                }
                return false;
            });
        }

        // ✅ 내용 수정
        board.setBcontent(request.getNewContent());

        // ✅ 새 이미지 업로드 추가
        if (newImages != null && !newImages.isEmpty()) {
            for (MultipartFile image : newImages) {
                if (image.isEmpty()) continue;

                try {
                    String uploadDir = new File("src/main/resources/static/uploads/img").getAbsolutePath();
                    String filename = UUID.randomUUID() + "_" + image.getOriginalFilename();
                    Path filepath = Paths.get(uploadDir, filename);
                    Files.createDirectories(filepath.getParent());
                    Files.copy(image.getInputStream(), filepath, StandardCopyOption.REPLACE_EXISTING);

                    BoardImgTable img = new BoardImgTable();
                    img.setBoard(board);
                    // ✅ /uploads/img로 경로 통일!
                    img.setBiurl("/uploads/img/" + filename);
                    img.setBititle("첨부 이미지");
                    img.setBiuploadedat(LocalDateTime.now());

                    board.getImages().add(img);

                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }
    }

    // ✅ 게시글 삭제
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
