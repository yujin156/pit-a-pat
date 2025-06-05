
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
    public BoardTable createPost(BoardCreateRequest request, List<MultipartFile> newImages, Long authorDogDno) { // 🌟 dno 파라미터 이름 변경 및 사용
        // 🌟 request.getDno() 대신 파라미터로 받은 authorDogDno 사용
        Dog dog = dogRepository.findById(authorDogDno)
                .orElseThrow(() -> new IllegalArgumentException("작성자 강아지 정보 없음 (dno: " + authorDogDno + ")"));

        GroupTable group = groupRepository.findById(request.getGno())
                .orElseThrow(() -> new IllegalArgumentException("그룹 정보 없음 (gno: " + request.getGno() + ")"));

        // (선택 사항) 여기서 한 번 더 authorDogDno를 가진 강아지가 실제로 group의 멤버인지 확인하는 로직을 추가할 수 있습니다.
        // 이미 getDefaultDnoForGroup에서 확인했지만, 서비스 계층에서 독자적인 검증을 원한다면 추가 가능.
        // boolean isMember = groupMemberRepository.existsByGroupTableAndDogAndState(group, dog, MemberStatus.ACCEPTED);
        // if (!isMember) {
        //     throw new SecurityException("해당 강아지는 이 그룹의 멤버가 아니므로 게시글을 작성할 수 없습니다.");
        // }

        BoardTable board = new BoardTable();
        board.setBcontent(request.getContent());
        board.setWriterdog(dog); // 🌟 명시적으로 authorDogDno로 찾은 Dog 객체 설정
        board.setGroup(group);
        // board.setBregdate(LocalDateTime.now()); // BoardTable 엔티티에 @CreationTimestamp 등이 없다면 직접 설정

        BoardTable savedBoard = boardRepository.save(board);

        System.out.println("🔥 createPost - newImages: " + (newImages != null ? newImages.size() + "개" : "null"));
        if (newImages != null) {
            for (MultipartFile file : newImages) {
                if (file != null && !file.isEmpty()) { // null 및 empty 체크 강화
                    System.out.println("  🔹 처리할 파일: " + file.getOriginalFilename() + ", size: " + file.getSize());
                }
            }
        }

        if (newImages != null && !newImages.isEmpty()) {
            for (MultipartFile image : newImages) {
                if (image == null || image.isEmpty()) continue; // 각 파일에 대한 null/empty 체크

                String imgUrl = saveImage(image);

                BoardImgTable img = new BoardImgTable();
                img.setBoard(savedBoard); // savedBoard 사용 (ID가 생성된 후)
                img.setBiurl(imgUrl);
                img.setBititle(image.getOriginalFilename()); // 원본 파일명 또는 다른 제목 설정 가능
                // img.setBiuploadedat(LocalDateTime.now()); // BoardImgTable에 @CreationTimestamp 등이 없다면 직접 설정
                boardImgRepository.save(img);
            }
            // boardImgRepository.flush(); // @Transactional 범위 내에서는 보통 자동 flush. 꼭 필요하지 않다면 생략 가능.
        }

        return savedBoard; // entityManager.refresh(savedBoard) 등을 통해 이미지 목록까지 완전히 채워진 객체를 반환할 수도 있음
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
