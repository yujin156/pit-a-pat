package pit.pet.Group.Controller;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import pit.pet.Account.Repository.DogRepository;
import pit.pet.Account.Repository.UserRepository;
import pit.pet.Account.User.Dog;
import pit.pet.Account.User.User;
import pit.pet.Board.Entity.BoardTable;
import pit.pet.Board.Service.BoardManageService;
import pit.pet.Group.Repository.GroupMemberRepository;
import pit.pet.Group.Request.ApplyGroupRequest;
import pit.pet.Group.Request.CreateGroupRequest;
import pit.pet.Group.Request.UpdateMemberStatusRequest;
import pit.pet.Group.Service.GroupMemberService;
import pit.pet.Group.Service.GroupService;
import pit.pet.Group.entity.GroupMemberTable;
import pit.pet.Group.entity.GroupTable;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
@RequestMapping("/groups")
public class GroupController {
    private final GroupService groupService;
    private final GroupMemberService groupMemberService;
    private final DogRepository dogRepository;
    private final UserRepository userRepository;
    private final BoardManageService boardManageService;
    private final GroupMemberRepository groupMemberRepository;

    // 그룹 생성 폼 페이지
    @GetMapping("/create")
    public String createGroupForm(Model model,
                                  @AuthenticationPrincipal UserDetails principal) {
        User me = userRepository.findByUemail(principal.getUsername())
                .orElseThrow();
        List<Dog> myDogs = dogRepository.findByOwner(me);
        model.addAttribute("createGroupRequest", new CreateGroupRequest());
        model.addAttribute("myDogs", myDogs);
        return "Group/Create";
    }

    // 그룹 생성 처리
    @PostMapping("/create")
    public String createGroup(@ModelAttribute CreateGroupRequest request) {
        Dog dog = dogRepository.findById(request.getDogId())
                .orElseThrow(() -> new RuntimeException("해당 강아지를 찾을 수 없습니다."));
        groupService.createGroup(request.getGname(),
                request.getGroupInfo(),
                request.getInterest(),
                dog);
        return "redirect:/groups/list";
    }

    // 전체 그룹, 가입한 그룹 보여주기
    @GetMapping("/list")
    public String groupList(Model model,
                            @AuthenticationPrincipal UserDetails principal) {

        // 🔥 로그인 안되어 있으면 /login으로 리다이렉트
        if (principal == null) {
            return "Account/Login";
        }

        // 전체 그룹 목록
        List<GroupTable> groups = groupService.getAllGroups();
        model.addAttribute("groupList", groups);

        // 🔥 리더 이름 맵 만들기: <gno, dname>
        Map<Long, String> leaderNames = new HashMap<>();
        for (GroupTable group : groups) {
            Long leaderGmno = group.getGleader(); // GroupMemberTable의 PK
            groupMemberRepository.findById(leaderGmno).ifPresent(member -> {
                leaderNames.put(group.getGno(), member.getDog().getDname());
            });
        }
        model.addAttribute("leaderNames", leaderNames); // Thymeleaf에서 group.gno로 조회

        // 현재 로그인한 유저의 강아지 → 그룹 가입 목록
        User me = userRepository.findByUemail(principal.getUsername())
                .orElseThrow();
        List<Dog> myDogs = dogRepository.findByOwner(me);
        List<GroupMemberTable> myMemberships = groupMemberService.findByDogs(myDogs);
        model.addAttribute("myMemberships", myMemberships);

        return "Group/List";
    }

    // 그룹 가입 신청 폼 (강아지 선택)
    @GetMapping("/{gno}/apply")
    public String showApplyForm(@PathVariable Long gno,
                                @AuthenticationPrincipal UserDetails principal,
                                Model model) {
        User me = userRepository.findByUemail(principal.getUsername())
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));
        List<Dog> myDogs = dogRepository.findByOwner(me);

        model.addAttribute("gno", gno);
        model.addAttribute("myDogs", myDogs);
        return "Group/Apply";
    }

    // 그룹 가입 신청 처리
    @PostMapping("/{gno}/apply")
    public String applyGroup(@PathVariable Long gno,
                             @ModelAttribute ApplyGroupRequest request) {
        Dog dog = dogRepository.findById(request.getDogId())
                .orElseThrow(() -> new RuntimeException("해당 강아지를 찾을 수 없습니다."));
        groupMemberService.applyMembership(gno, dog);
        return "redirect:/groups/list";
    }

    // 가입 요청 관리 폼 (리더만 가능)
    @GetMapping("/{gno}/manage")
    public String manageGroup(@PathVariable Long gno,
                              @AuthenticationPrincipal UserDetails principal,
                              Model model) {
        User me = userRepository.findByUemail(principal.getUsername())
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));
        List<Dog> myDogs = dogRepository.findByOwner(me);

        Long leaderGmno = groupMemberService.getLeaderGmno(gno, myDogs);

        if (leaderGmno == null) {
            throw new RuntimeException("접근 권한이 없습니다. (리더만 접근 가능)");
        }

        List<GroupMemberTable> members = groupMemberService.getAllMembers(gno);

        model.addAttribute("groupId", gno);
        model.addAttribute("leaderGmno", leaderGmno);
        model.addAttribute("members", members);
        return "Group/Manage";
    }

    // 가입 승인/거절 처리
    @PostMapping("/{gno}/members/{gmno}/status")
    public String updateMemberStatus(@PathVariable Long gno,
                                     @PathVariable Long gmno,
                                     @ModelAttribute UpdateMemberStatusRequest request) {
        groupMemberService.handleJoinRequest(gmno, request.getStatus(), request.getLeaderGmno());
        return "redirect:/groups/" + gno + "/manage";
    }

    // 멤버 탈퇴
    @GetMapping("/mygroups")
    public String myGroups(@AuthenticationPrincipal UserDetails principal,
                           Model model) {
        User me = userRepository.findByUemail(principal.getUsername())
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));
        List<Dog> myDogs = dogRepository.findByOwner(me);

        List<GroupMemberTable> myMemberships = groupMemberService.findByDogs(myDogs);

        model.addAttribute("myMemberships", myMemberships);
        return "Group/Mygroups";
    }

    @PostMapping("/members/{gmno}/withdraw")
    public String withdraw(@PathVariable Long gmno,
                           @RequestParam Long requesterGmno) {
        groupMemberService.withdraw(gmno, requesterGmno);
        return "redirect:/groups/mygroups";
    }

    @PostMapping("/{gno}/delegate")
    public String delegateLeader(@PathVariable Long gno,
                                 @RequestParam Long newLeaderGmno,
                                 @RequestParam Long currentLeaderGmno) {
        groupService.changeLeader(gno, currentLeaderGmno, newLeaderGmno);

        return "redirect:/groups/list";
    }

    @GetMapping("/{gno}")
    public String groupDetail(@PathVariable Long gno, Model model) {
        GroupTable group = groupService.findById(gno);
        List<BoardTable> boardList = boardManageService.getBoardListByGroup(group);

        model.addAttribute("group", group);
        model.addAttribute("boardList", boardList);

        return "Group/Detail";
    }
}
