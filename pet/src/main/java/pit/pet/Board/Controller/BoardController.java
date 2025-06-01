package pit.pet.Board.Controller;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import pit.pet.Account.Repository.DogRepository;
import pit.pet.Account.Repository.UserRepository;
import pit.pet.Account.User.Dog;
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

    // ✅ 게시글 작성
    @PostMapping("/create")
    public String createPost(@ModelAttribute BoardCreateRequest request,
                             @ModelAttribute BoardImgUploadRequest imgRequest) {

        System.out.println("===== 📩 게시글 생성 요청 =====");
        System.out.println("받은 dno = " + request.getDno());
        System.out.println("받은 gno = " + request.getGno()); // ✅ 수정
        System.out.println("받은 content = " + request.getContent());
        System.out.println("받은 이미지 수 = " + (imgRequest.getImageFiles() != null ? imgRequest.getImageFiles().size() : 0));

        BoardTable saved = boardWriteService.createPost(request, imgRequest);

        System.out.println("✅ 저장된 게시글 bno = " + saved.getBno());

        return "redirect:/board/view/" + saved.getBno();
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

        model.addAttribute("gno", gno);
        model.addAttribute("myGroupDogs", myGroupDogs);
        model.addAttribute("boardWriteRequest", new BoardCreateRequest());
        return "board/write";
    }

    @GetMapping("/api/my-group-dogs")
    @ResponseBody
    public List<Dog> getMyGroupDogs(@RequestParam Long gno,
                                    @AuthenticationPrincipal UserDetails principal) {
        User me = userRepository.findByUemail(principal.getUsername())
                .orElseThrow();

        List<Dog> myDogs = dogRepository.findByOwner(me);
        // 그룹에 소속된 강아지만 필터링
        return myDogs.stream()
                .filter(dog -> groupMemberService.isInGroup(dog.getDno(), gno))
                .toList();
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
                .orElseThrow();

        List<Dog> myDogs = dogRepository.findByOwner(me);
        Long dno = myDogs.isEmpty() ? null : myDogs.get(0).getDno();

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
        Long dno = myDogs.isEmpty() ? null : myDogs.get(0).getDno();
        BoardTable board = boardRepository.findById(bno)
                .orElseThrow(() -> new IllegalArgumentException("삭제할 게시글 없음"));
        Long gno = board.getGroup().getGno();

        boardWriteService.deletePost(bno, dno);
        return "redirect:/groups/" + gno;
    }

//    @GetMapping("/api/posts")
//    @ResponseBody
//    public List<Map<String, Object>> getPosts() {
//        List<BoardTable> boards = boardRepository.findAll();
//        List<Map<String, Object>> posts = new ArrayList<>();
//
//        for (BoardTable board : boards) {
//            Map<String, Object> post = new HashMap<>();
//            post.put("id", board.getBno());
//
//            // 작성자 정보
//            if (board.getWriterdog() != null) {
//                post.put("writerdog", Map.of(
//                        "dno", board.getWriterdog().getDno(),
//                        "dname", board.getWriterdog().getDname()
//                ));
//            } else {
//                post.put("writerdog", Map.of(
//                        "dno", null,
//                        "dname", "알 수 없음"
//                ));
//            }
//
//            // ✅ 이미지 목록: biurl을 그대로 반환
//            List<String> imgUrls = boardImgRepository.findByBoard(board).stream()
//                    .map(img -> {
//                        // biurl이 이미 '/uploads/img/파일명' 형태임!
//                        return img.getBiurl();
//                    })
//                    .toList();
//            post.put("images", imgUrls);
//
//            post.put("timeAgo", "1시간 전"); // TODO: 실제 계산 로직으로 바꾸기
//            post.put("content", board.getBcontent());
//            post.put("description", board.getBdesc());
//
//
//            post.put("commentCount", board.getCommentCount());
//
//            posts.add(post);
//        }
//        return posts;
//    }

//    @GetMapping("/api/groups/{gno}/posts")
//    @ResponseBody
//    public List<Map<String, Object>> getPostsByGroup(@PathVariable Long gno) {
//        List<BoardTable> boards = boardRepository.findByGroup_Gno(gno); // ✅ 그룹별 게시글만
//        List<Map<String, Object>> posts = new ArrayList<>();
//
//        for (BoardTable board : boards) {
//            Map<String, Object> post = new HashMap<>();
//            post.put("bno", board.getBno());
//            post.put("dno", board.getWriterdog().getDno());
//            post.put("writerDogName", board.getWriterdog().getDname());
//            post.put("gno", board.getGroup().getGno());
//            post.put("bcontent", board.getBcontent());
//            post.put("commentCount", board.getCommentCount());
//
//            // ✅ 이미지 URL 리스트도 담아주기
//            List<String> imgUrls = boardImgRepository.findByBoard(board)
//                    .stream()
//                    .map(BoardImgTable::getBiurl)
//                    .toList();
//            post.put("images", imgUrls);
//
//            posts.add(post);
//        }
//        return posts;
//    }


    // ✅ 게시글 상세 보기
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

        System.out.println("✅ group = " + group);
        System.out.println("✅ boardImages = " + boardImages);

        return "board/detail";
    }


}