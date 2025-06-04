
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
    private String saveImage(MultipartFile image) {
        try {
            String uploadDir = "C:/Users/user1/Desktop/pit-a-pat/pet/src/main/resources/static/uploads/img";
            String filename = UUID.randomUUID() + "_" + image.getOriginalFilename();
            Path filepath = Paths.get(uploadDir, filename);
            Files.createDirectories(filepath.getParent());
            Files.copy(image.getInputStream(), filepath, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/img/" + filename;
        } catch (Exception e) {
            throw new RuntimeException("이미지 저장 실패", e);
        }
    }

    @PersistenceContext
    private EntityManager entityManager;

    // ✅ 게시글 작성
    @Transactional
    public BoardTable createPost(BoardCreateRequest request, List<MultipartFile> newImages, Long dno) {
        Dog dog = dogRepository.findById(request.getDno())
                .orElseThrow(() -> new IllegalArgumentException("작성자 정보 없음"));
        GroupTable group = groupRepository.findById(request.getGno())
                .orElseThrow(() -> new IllegalArgumentException("그룹 정보 없음"));

        BoardTable board = new BoardTable();
        board.setBcontent(request.getContent());
        board.setWriterdog(dog);
        board.setGroup(group);

        BoardTable savedBoard = boardRepository.save(board);

        // 🌟 여기서 newImages 로그를 찍어보자!
        System.out.println("🔥 createPost - newImages: " + newImages);
        if (newImages != null) {
            for (MultipartFile file : newImages) {
                System.out.println("  🔹 fileName: " + file.getOriginalFilename() + ", size: " + file.getSize());
            }
        }


        // 🔥 여기서 직접 newImages로 처리!
        if (newImages != null && !newImages.isEmpty()) {
            for (MultipartFile image : newImages) {
                if (image.isEmpty()) continue;

                String imgUrl = saveImage(image); // ⭐️ 공통 메서드 사용

                BoardImgTable img = new BoardImgTable();
                img.setBoard(savedBoard);
                img.setBiurl(imgUrl);
                img.setBititle("첨부 이미지");
                img.setBiuploadedat(LocalDateTime.now());
                boardImgRepository.save(img);
            }
            boardImgRepository.flush();
        }

        return savedBoard;
    }

    // ✅ 게시글 내용 수정
    @Transactional
    public void updateBoard(BoardUpdateRequest request, // DTO에 deleteImgIds 포함
                            List<MultipartFile> newImages,
                            Long dno) { // deleteImgIds 파라미터 제거

        BoardTable board = boardRepository.findById(request.getBno())
                .orElseThrow(() -> new IllegalArgumentException("해당 게시글 없음"));

        if (!board.getWriterdog().getDno().equals(dno)) {
            throw new SecurityException("수정 권한 없음");
        }

        // DTO에서 deleteImgIds 가져오기
        List<Integer> deleteImgIds = request.getDeleteImgIds();
        System.out.println("삭제할 bino들: " + deleteImgIds);

        // ✅ 삭제 대상 이미지 제거
        if (deleteImgIds != null && !deleteImgIds.isEmpty()) {
            board.getImages().removeIf(img -> {
                if (deleteImgIds.contains(img.getBino())) {
                    try {
                        String realPath = new File("src/main/resources/static" + img.getBiurl()).getAbsolutePath();
                        Files.deleteIfExists(Path.of(realPath));
                    } catch (Exception e) {
                        e.printStackTrace(); // 실제 운영에서는 로깅 프레임워크 사용
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

                    String imgUrl = saveImage(image); // ⭐️ 공통 메서드 사용

                    BoardImgTable img = new BoardImgTable();
                    img.setBoard(board);
                    img.setBiurl(imgUrl);
                    img.setBititle("첨부 이미지");
                    img.setBiuploadedat(LocalDateTime.now());

                    board.getImages().add(img);
                }
            }

            // 🔥 진짜 반영 로직!
        boardRepository.save(board);
        entityManager.flush();
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
