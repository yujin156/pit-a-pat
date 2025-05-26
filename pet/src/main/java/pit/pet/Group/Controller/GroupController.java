package pit.pet.Group.Controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
import pit.pet.Group.entity.MemberStatus;

import java.util.*;
import java.util.stream.Collectors;

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
    @ResponseBody
    public ResponseEntity<Void> createGroupAjax(
            @RequestParam String interest,
            @RequestParam String gname,
            @RequestParam(required = false) String groupInfo,
            @RequestParam Long dogId) {
        Dog dog = dogRepository.findById(dogId)
                .orElseThrow(() -> new RuntimeException("해당 강아지를 찾을 수 없습니다."));
        groupService.createGroup(gname, groupInfo, interest, dog);
        return ResponseEntity.ok().build();
    }

    // 전체 그룹, 가입한 그룹 보여주기
    @GetMapping("/list")
    public String groupList(
            Model model,
            @AuthenticationPrincipal UserDetails principal
    ) throws JsonProcessingException {

        // 1) 전체 그룹
        List<GroupTable> all = groupService.getAllGroups();

        // 2) 내 강아지들
        User me = userRepository.findByUemail(principal.getUsername()).orElseThrow();
        List<Dog> myDogs = dogRepository.findByOwner(me);

        // 3) 내가 만든 그룹  (GroupTable.dog 이 내 강아지인 것)
        List<GroupTable> created = all.stream()
                .filter(g -> myDogs.contains(g.getDog()))
                .collect(Collectors.toList());

        // 4) 내가 가입한(=MemberStatus.ACCEPTED) 그룹
        List<GroupMemberTable> memberships = groupMemberService.findByDogs(myDogs);
        List<GroupTable> joined = memberships.stream()
                .filter(m -> m.getState() == MemberStatus.ACCEPTED)
                .map(GroupMemberTable::getGroupTable)
                .collect(Collectors.toList());

        // 5) 내 그룹 = 만든 그룹 ∪ 가입 그룹 (중복 제거)
        LinkedHashSet<GroupTable> set = new LinkedHashSet<>();
        set.addAll(created);
        set.addAll(joined);
        List<GroupTable> myGroups = new ArrayList<>(set);

        // 6) 가입 현황 리스트 (pending/approved/rejected 모두 보여줄 탭용)
        //    ※ 가입 현황 탭에만 쓸 JSON
        //    (status: pending|approved|rejected)
        //    title, imageUrl, avatarUrl, id
        //    ← 이건 myMemberships 전체를 사용
        List<Map<String,Object>> applicationDto = memberships.stream()
                .map(m -> Map.<String,Object>of(
                        "id",       m.getGroupTable().getGno(),
                        "title",    m.getGroupTable().getGname(),
                        "imageUrl", "/groups/" + m.getGroupTable().getGno() + "/image",
                        "avatarUrl","/dogs/"   + m.getDog().getDno()       + "/avatar",
                        "status",   m.getState().name().toLowerCase()
                ))
                .collect(Collectors.toList());

        // 7) DTO 를 JSON 으로 직렬화
        ObjectMapper om = new ObjectMapper();

        // 전체 그룹 JSON
        List<Map<String,Object>> allDto = all.stream()
                .map(g -> Map.<String,Object>of(
                        "id",        g.getGno(),
                        "title",     g.getGname(),
                        "imageUrl",  "/groups/" + g.getGno() + "/image",
                        "avatarUrl", "/dogs/"   + g.getDog().getDno() + "/avatar"
                ))
                .collect(Collectors.toList());

        // 내 그룹 JSON
        List<Map<String,Object>> myDto = myGroups.stream()
                .map(g -> Map.<String,Object>of(
                        "id",        g.getGno(),
                        "title",     g.getGname(),
                        "imageUrl",  "/groups/" + g.getGno() + "/image",
                        "avatarUrl", "/dogs/"   + g.getDog().getDno() + "/avatar"
                ))
                .collect(Collectors.toList());

        // 모델에 올려주기
        model.addAttribute("allGroupsJson",         om.writeValueAsString(allDto));
        model.addAttribute("myGroupsJson",          om.writeValueAsString(myDto));
        model.addAttribute("applicationGroupsJson", om.writeValueAsString(applicationDto));

        // (기존 Thymeleaf 바인딩용)
        model.addAttribute("groupList", all);
        model.addAttribute("myDogs",    myDogs);
        model.addAttribute("myMemberships", memberships);

        return "Group/Group";
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
