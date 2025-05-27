package pit.pet.Board.Controller;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import pit.pet.Account.Repository.DogRepository;
import pit.pet.Account.Repository.UserRepository;
import pit.pet.Account.User.Dog;
import pit.pet.Account.User.User;
import pit.pet.Board.Entity.BoardCommentTable;
import pit.pet.Board.Entity.BoardTable;
import pit.pet.Board.Repository.BoardCommentRepository;
import pit.pet.Board.Repository.BoardRepository;
import pit.pet.Board.Request.BoardCreateRequest;
import pit.pet.Board.Request.BoardImgUploadRequest;
import pit.pet.Board.Request.BoardUpdateRequest;
import pit.pet.Board.Service.BoardCommentService;
import pit.pet.Board.Service.BoardManageService; // BoardManageService 임포트 추가
import pit.pet.Board.Service.BoardWriteService;
import pit.pet.Board.Entity.BoardListTable;
import pit.pet.Board.Repository.BoardListRepository;
import pit.pet.Group.Service.GroupMemberService;
import pit.pet.Group.entity.GroupTable;

import java.util.List;

@Controller
@RequiredArgsConstructor
@RequestMapping("/board")
public class BoardController {

    private final BoardWriteService boardWriteService;
    private final UserRepository userRepository;
    private final DogRepository dogRepository;
    private final GroupMemberService groupMemberService;
    private final BoardListRepository boardListRepository;
    private final BoardRepository boardRepository;
    private final BoardCommentService boardCommentService;
    private final BoardCommentRepository boardCommentRepository;
    private final BoardManageService boardManageService; // ✅ BoardManageService 주입 추가


    // ✅ 게시글 작성
    @PostMapping("/create")
    public String createPost(@ModelAttribute BoardCreateRequest request,
                             @ModelAttribute BoardImgUploadRequest imgRequest) {

        System.out.println("===== 📩 게시글 생성 요청 =====");
        System.out.println("받은 dno = " + request.getDno());
        System.out.println("받은 blno = " + request.getBlno());
        System.out.println("받은 content = " + request.getContent());
        System.out.println("받은 이미지 수 = " + (imgRequest.getImageFiles() != null ? imgRequest.getImageFiles().size() : 0));

        BoardTable saved = boardWriteService.createPost(request, imgRequest);

        System.out.println("✅ 저장된 게시글 bno = " + saved.getBno());

        return "redirect:/board/view/" + saved.getBno();
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


    // ✅ 게시글 수정
    @PostMapping("/update")
    public String updateBoard(@ModelAttribute BoardUpdateRequest request,
                              @RequestParam(value = "newImages", required = false) List<MultipartFile> newImages,
                              @RequestParam(value = "deleteImgIds", required = false) List<Integer> deleteImgIds,
                              @AuthenticationPrincipal UserDetails principal) {

        User me = userRepository.findByUemail(principal.getUsername())
                .orElseThrow(); // ✅ 로그인 유저 가져오기
        if (me == null) {
            throw new IllegalStateException("로그인 유저 정보가 없습니다.");
        }

        List<Dog> myDogs = dogRepository.findByOwner(me);
        Long dno = myDogs.isEmpty() ? null : myDogs.get(0).getDno(); // ✅ 대표 강아지 dno

        if (dno == null) {
            throw new IllegalStateException("대표 강아지를 찾을 수 없습니다.");
        }

        boardWriteService.updateBoard(request, newImages, deleteImgIds, dno);
        return "redirect:/board/view/" + request.getBno();
    }

    // ✅ 게시글 삭제
    @PostMapping("/delete")
    public String deletePost(@RequestParam Long bno,
                             @AuthenticationPrincipal UserDetails principal) {
        User me = userRepository.findByUemail(principal.getUsername())
                .orElseThrow();

        List<Dog> myDogs = dogRepository.findByOwner(me);
        Long dno = myDogs.isEmpty() ? null : myDogs.get(0).getDno(); // 대표 강아지 사용
        BoardTable board = boardRepository.findById(bno)
                .orElseThrow(() -> new IllegalArgumentException("삭제할 게시글 없음"));
        Long gno = board.getGroup().getGno();

        boardWriteService.deletePost(bno, dno);
        return "redirect:/groups/" + gno;
    }

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

        BoardListTable boardList = boardListRepository.findByGroupTableGno(gno)
                .orElseThrow(() -> new IllegalArgumentException("게시판이 없습니다."));
        model.addAttribute("blno", boardList.getBlno());

        model.addAttribute("gno", gno);
        model.addAttribute("myGroupDogs", myGroupDogs);
        model.addAttribute("boardWriteRequest", new BoardCreateRequest());
        return "board/write";
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
            loginDog = myGroupDogs.get(0); // 첫 번째 그룹 소속 강아지를 대표로 사용
            model.addAttribute("loginDog", loginDog); // loginDog를 모델에 추가
        }

        // 좋아요/북마크 상태 확인 및 모델에 추가
        boolean isLiked = false;
        boolean isBookmarked = false;
        if (loginDog != null) {
            isLiked = boardManageService.isBoardLiked(bno, loginDog.getDno());
            isBookmarked = boardManageService.isBoardBookmarked(bno, loginDog.getDno());
        }
        model.addAttribute("isLiked", isLiked);
        model.addAttribute("isBookmarked", isBookmarked);


        model.addAttribute("board", board);
        model.addAttribute("commentList", commentList);
        model.addAttribute("myGroupDogs", myGroupDogs);
        return "board/detail";
    }
}