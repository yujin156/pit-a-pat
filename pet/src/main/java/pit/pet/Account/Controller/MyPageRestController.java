package pit.pet.Account.Controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import pit.pet.Account.Repository.DogRepository;
import pit.pet.Account.Repository.UserRepository;
import pit.pet.Account.Response.DogProfileResponse;
import pit.pet.Account.Service.CustomUserDetails;
import pit.pet.Account.Service.DogService;
import pit.pet.Account.User.Dog;
import pit.pet.Account.User.User;
import pit.pet.Board.Entity.BoardCommentTable;
import pit.pet.Board.Entity.BoardTable;
import pit.pet.Board.Repository.BoardCommentRepository;
import pit.pet.Board.Repository.BoardRepository;

import java.security.Principal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mypage")
@RequiredArgsConstructor
public class MyPageRestController {
    private final UserRepository userRepository;
    private final DogRepository dogRepository;
    private final BoardRepository boardRepository;
    private final BoardCommentRepository boardCommentRepository;
    private final DogService dogService;

    // 내가 쓴 게시글

    @GetMapping("/posts")
    public List<Map<String, Object>> getMyPosts(@AuthenticationPrincipal CustomUserDetails principal) {
        User user = userRepository.findByUemail(principal.getUsername()).orElseThrow();
        List<Dog> myDogs = dogRepository.findByOwner(user);
        List<BoardTable> myBoards = boardRepository.findByWriterdogIn(myDogs);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        return myBoards.stream().map(board -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", board.getBno());
            map.put("image", (!board.getImages().isEmpty() ? board.getImages().get(0).getBiurl() : "/img/default.jpg"));
            map.put("title", board.getBdesc());
            map.put("description", board.getBcontent());
            LocalDateTime nowtime = board.getBnowtime();
            // 날짜를 문자열로 변환해서 내려줌 (⭐️)
            map.put("time", nowtime != null ? nowtime.format(formatter) : null);
            map.put("groupId", board.getGroup().getGno());
            map.put("groupName", board.getGroup().getGname());
            return map;
        }).toList();
    }


    // 내가 쓴 댓글
    @GetMapping("/comments")
    public List<Map<String, Object>> getMyComments(@AuthenticationPrincipal CustomUserDetails principal) {
        User user = userRepository.findByUemail(principal.getUsername()).orElseThrow();
        List<Dog> myDogs = dogRepository.findByOwner(user);
        List<BoardCommentTable> myComments = boardCommentRepository.findByDogIn(myDogs);
        return myComments.stream().map(comment -> {
            BoardTable board = comment.getBoard();
            String boardImg = (!board.getImages().isEmpty() ? board.getImages().get(0).getBiurl() : "/img/default.jpg");
            return Map.of(
                    "id", comment.getBcno(),
                    "text", comment.getBccomment(),
                    "date", comment.getCreatedAt().toString(),
                    "linkedPost", Map.of(
                            "image", boardImg,
                            "title", board.getBdesc()
                    )
            );
        }).toList();
    }

    @DeleteMapping("/{dno}")
    public ResponseEntity<String> deleteDog(@PathVariable Long dno, Principal principal) {
        dogService.deleteDogById(dno, principal); // 소유자 체크도 같이!
        return ResponseEntity.ok("강아지 삭제 완료!");
    }

    @GetMapping("/dogs")
    public ResponseEntity<?> getMyDogs(@AuthenticationPrincipal CustomUserDetails principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인 필요");
        }
        User user = userRepository.findByUemail(principal.getUsername())
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));
        List<Dog> dogs = dogRepository.findByOwner(user);
        List<DogProfileResponse> result = dogs.stream()
                .map(DogProfileResponse::fromEntity)
                .toList();
        return ResponseEntity.ok(result);
    }

}