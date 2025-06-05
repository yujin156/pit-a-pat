package pit.pet.Board.Controller;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import pit.pet.Account.Repository.DogRepository;
import pit.pet.Account.Repository.UserRepository;
import pit.pet.Account.User.Dog;
import pit.pet.Account.User.DogDTO;
import pit.pet.Account.User.User;
import pit.pet.Board.Entity.BoardCommentTable;
import pit.pet.Board.Entity.BoardImgTable;
import pit.pet.Board.Entity.BoardTable;
import pit.pet.Board.Repository.BoardCommentRepository;
import pit.pet.Board.Repository.BoardImgRepository;
import pit.pet.Board.Repository.BoardRepository;
import pit.pet.Board.Request.BoardCreateRequest;
import pit.pet.Board.Request.BoardImgUploadRequest;
import pit.pet.Board.Request.BoardUpdateRequest;
import pit.pet.Board.Service.BoardCommentService;
import pit.pet.Board.Service.BoardManageService;
import pit.pet.Board.Service.BoardWriteService;
import pit.pet.Group.Service.GroupMemberService;
import pit.pet.Group.entity.GroupTable;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Controller
@RequiredArgsConstructor
@RequestMapping("/board")
public class BoardController {

    private final BoardWriteService boardWriteService;
    private final UserRepository userRepository;
    private final DogRepository dogRepository;
    private final GroupMemberService groupMemberService;

    private final BoardRepository boardRepository;
    private final BoardCommentService boardCommentService;
    private final BoardCommentRepository boardCommentRepository;
    private final BoardManageService boardManageService;
    private final BoardImgRepository boardImgRepository;

    // ✅ 게시글 작성 폼
    @GetMapping("/write")
    public String writeForm(@RequestParam Long gno,
                            Model model,
                            @AuthenticationPrincipal UserDetails principal) {
        User me = userRepository.findByUemail(principal.getUsername())
                .orElseThrow();

        // 내 강아지 중 이 그룹(gno)에 소속된 것만 필터링
        List<Dog> myDogs = dogRepository.findByOwner(me);
        List<Dog> myGroupDogs = myDogs.stream()
                .filter(dog -> groupMemberService.isInGroup(dog.getDno(), gno))
                .toList();

        model.addAttribute("gno", gno);
        model.addAttribute("myGroupDogs", myGroupDogs);
        model.addAttribute("boardWriteRequest", new BoardCreateRequest());
        return "board/write";
    }

    @PostMapping("/api/create") // 또는 실제 게시글 생성 API 경로
    @ResponseBody
    public ResponseEntity<?> createPostApi(
            @ModelAttribute BoardCreateRequest request, // BoardCreateRequest에는 gno, content 등이 있어야 함
            @RequestParam(value = "newImages", required = false) List<MultipartFile> imageFiles,
            @AuthenticationPrincipal UserDetails principal) {

        System.out.println("🔥 게시글 생성 요청 - gno: " + request.getGno() + ", content: " + request.getContent());
        if (imageFiles != null) {
            imageFiles.forEach(f -> System.out.println("  🔹 받은 파일: " + f.getOriginalFilename()));
        }

        User me = userRepository.findByUemail(principal.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("유저 정보 없음"));

        Long gnoFromRequest = request.getGno();
        if (gnoFromRequest == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "그룹 번호(gno)가 필요합니다."));
        }

        // 🌟 1. 해당 그룹에 글을 쓸 수 있는 사용자의 강아지 dno 결정 (댓글 로직과 동일하게)
        Long dnoToUseForBoard;
        try {
            dnoToUseForBoard = boardCommentService.getDefaultDnoForGroup(gnoFromRequest, me.getUno());
        } catch (IllegalArgumentException e) {
            // getDefaultDnoForGroup에서 "이 그룹에 가입된 강아지가 없습니다." 등의 예외 발생 시
            System.err.println("게시글 작성 권한 확인 실패: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }

        if (dnoToUseForBoard == null) { // 혹시 모를 null 체크 (getDefaultDnoForGroup은 예외를 던지지만)
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "이 그룹에 게시글을 작성할 수 있는 강아지가 없습니다."));
        }

        System.out.println("[CONTROLLER-BoardCreate] 게시글 작성에 사용될 최종 강아지 DNO: " + dnoToUseForBoard);

        // 🌟 2. BoardCreateRequest DTO에서 dno 필드를 사용하지 않으므로,
        //    BoardWriteService.createPost 호출 시 dnoToUseForBoard를 명시적으로 전달합니다.
        //    BoardCreateRequest DTO에는 dno 필드가 없거나, 있어도 무시되도록 서비스에서 처리해야 합니다.
        BoardTable savedBoard = boardWriteService.createPost(request, imageFiles, dnoToUseForBoard);

        return ResponseEntity.ok(Map.of("bno", savedBoard.getBno(), "message", "게시글이 성공적으로 작성되었습니다."));
    }

    @GetMapping("/api/my-group-dogs")
    @ResponseBody
    public List<DogDTO> getMyGroupDogs(@RequestParam Long gno,
                                       @AuthenticationPrincipal UserDetails principal) {
        // 현재 로그인된 사용자 가져오기
        User me = userRepository.findByUemail(principal.getUsername())
                .orElseThrow();

        // 사용자 소속 강아지 목록 가져오기
        List<Dog> myDogs = dogRepository.findByOwner(me);

        // 그룹에 소속된 강아지만 필터링하여 DTO로 변환 후 반환
        return myDogs.stream()
                .filter(dog -> groupMemberService.isInGroup(dog.getDno(), gno)) // 그룹 소속 강아지 필터링
                .map(DogDTO::new) // Dog 엔티티를 DogDTO로 변환
                .collect(Collectors.toList());
    }

    // ✅ 게시글 수정 폼
    @GetMapping("/edit/{bno}")
    public String editForm(@PathVariable Long bno,
                           @AuthenticationPrincipal UserDetails principal,
                           Model model) {
        if (principal == null) return "redirect:/login";

        User user = userRepository.findByUemail(principal.getUsername())
                .orElseThrow();

        List<Dog> myDogs = dogRepository.findByOwner(user);
        Long dno = myDogs.isEmpty() ? null : myDogs.get(0).getDno();
        if (dno == null) return "redirect:/error";

        BoardTable board = boardRepository.findByIdWithImages(bno)
                .orElseThrow(() -> new IllegalArgumentException("게시글 없음"));

        if (!board.getWriterdog().getDno().equals(dno)) {
            throw new SecurityException("수정 권한 없음");
        }

        model.addAttribute("board", board);
        return "board/edit";
    }

    @GetMapping("/api/post/{bno}")
    @ResponseBody
    public ResponseEntity<?> getPost(@PathVariable Long bno) {
        BoardTable board = boardRepository.findByIdWithImages(bno)
                .orElseThrow(() -> new IllegalArgumentException("게시글 없음"));

        List<String> imageUrls = boardImgRepository.findByBoard(board)
                .stream().map(BoardImgTable::getBiurl).toList();

        List<Integer> imageIds = boardImgRepository.findByBoard(board)
                .stream().map(BoardImgTable::getBino).toList();

        Map<String, Object> response = new HashMap<>();
        response.put("bno", board.getBno());
        response.put("bcontent", board.getBcontent());
        response.put("images", imageUrls);
        response.put("imageIds", imageIds); // 이 줄!!

        response.put("gno", board.getGroup().getGno());

        return ResponseEntity.ok(response);
    }

    // ✅ 게시글 수정


    @PostMapping("/api/update")
    @ResponseBody
    public ResponseEntity<String> updateBoardApi(
            @Valid @ModelAttribute BoardUpdateRequest request, // bno, newContent, deleteImgIds는 이 객체로 받습니다.
            BindingResult bindingResult,
            @RequestParam(value = "newImages", required = false) List<MultipartFile> newImages,
            @AuthenticationPrincipal UserDetails principal) {

        if (bindingResult.hasErrors()) {
            // 유효성 검사 실패 시, 에러 메시지 조합하여 반환 가능
            StringBuilder sb = new StringBuilder();
            bindingResult.getAllErrors().forEach(error -> {
                sb.append(error.getDefaultMessage()).append("\n");
            });
            return ResponseEntity.badRequest().body(sb.toString());
        }

        // DTO에서 bno를 가져와서 확인
        if (request.getBno() == null) {
            return ResponseEntity.badRequest().body("게시글 ID(bno)가 null입니다.");
        }
        System.out.println("수정할 게시글의 bno (from DTO): " + request.getBno());
        System.out.println("수정할 내용 (from DTO): " + request.getNewContent()); // newContent도 확인 가능
        System.out.println("삭제할 이미지 ID 목록 (from DTO): " + request.getDeleteImgIds()); // deleteImgIds도 확인

        User me = userRepository.findByUemail(principal.getUsername())
                .orElseThrow();

        List<Dog> myDogs = dogRepository.findByOwner(me);
        Long dno = myDogs.isEmpty() ? null : myDogs.get(0).getDno();

        if (dno == null) {
            return ResponseEntity.badRequest().body("대표 강아지를 찾을 수 없습니다.");
        }

        // 서비스 호출 시 BoardUpdateRequest 객체와 필요한 파일만 전달
        // 서비스 내부에서 request.getDeleteImgIds()를 사용하도록 deleteImgIds 파라미터 제거 가능
        boardWriteService.updateBoard(request, newImages, dno); // deleteImgIds를 명시적으로 넘기지 않고 서비스에서 DTO를 사용하게 변경
        System.out.println("새 이미지:" + newImages);
        return ResponseEntity.ok("게시글 수정 성공");
    }

    // ✅ 게시글 삭제
    @PostMapping("/delete")
    public String deletePost(@RequestParam Long bno,
                             @AuthenticationPrincipal UserDetails principal) {
        User me = userRepository.findByUemail(principal.getUsername())
                .orElseThrow();

        List<Dog> myDogs = dogRepository.findByOwner(me);
        Long dno = myDogs.isEmpty() ? null : myDogs.get(0).getDno();
        BoardTable board = boardRepository.findById(bno)
                .orElseThrow(() -> new IllegalArgumentException("삭제할 게시글 없음"));
        Long gno = board.getGroup().getGno();

        boardWriteService.deletePost(bno, dno);
        return "redirect:/groups/" + gno;
    }

    @DeleteMapping("/api/delete")
    @ResponseBody
    public ResponseEntity<String> deletePostApi(@RequestParam Long bno,
                                                @AuthenticationPrincipal UserDetails principal) {
        User me = userRepository.findByUemail(principal.getUsername())
                .orElseThrow();

        List<Dog> myDogs = dogRepository.findByOwner(me);
        Long dno = myDogs.isEmpty() ? null : myDogs.get(0).getDno();

        boardWriteService.deletePost(bno, dno);
        return ResponseEntity.ok("게시글 삭제 성공");
    }

    // ✅ 게시글 상세 보기
    @GetMapping("/view/{bno}")
    public String viewBoard(@PathVariable Long bno,
                            @AuthenticationPrincipal UserDetails principal,
                            Model model) {
        BoardTable board = boardRepository.findById(bno)
                .orElseThrow(() -> new IllegalArgumentException("게시글 없음"));

        List<BoardCommentTable> commentList = boardCommentRepository.findByBoard(board);

        User me = userRepository.findByUemail(principal.getUsername())
                .orElseThrow();

        List<Dog> myDogs = dogRepository.findByOwner(me);

        GroupTable group = board.getGroup();
        List<Dog> myGroupDogs = myDogs.stream()
                .filter(dog -> groupMemberService.isInGroup(dog.getDno(), group.getGno()))
                .toList();

        Dog loginDog = null;
        if (!myGroupDogs.isEmpty()) {
            loginDog = myGroupDogs.get(0);
            model.addAttribute("loginDog", loginDog);
        }

        boolean isLiked = false;
        boolean isBookmarked = false;
        if (loginDog != null) {
            isLiked = boardManageService.isBoardLiked(bno, loginDog.getDno());
            isBookmarked = boardManageService.isBoardBookmarked(bno, loginDog.getDno());
        }

        // ✅ 게시글 이미지 불러오기
        List<BoardImgTable> boardImages = boardImgRepository.findByBoard(board);

        // 뷰에 내려줄 데이터들
        model.addAttribute("isLiked", isLiked);
        model.addAttribute("isBookmarked", isBookmarked);
        model.addAttribute("group", group);
        model.addAttribute("board", board);
        model.addAttribute("commentList", commentList);
        model.addAttribute("myGroupDogs", myGroupDogs);
        model.addAttribute("boardImages", boardImages); // ✅ 이미지 리스트도 모델로 내려줌!


        return "board/detail";
    }


}