package pit.pet.Group.Controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import pit.pet.Account.Repository.DogRepository;
import pit.pet.Account.Repository.UserRepository;
import pit.pet.Account.User.Dog;
import pit.pet.Account.User.DogDTO;
import pit.pet.Account.User.User;
import pit.pet.Board.Service.BoardManageService;
import pit.pet.Group.Repository.GroupMemberRepository;
import pit.pet.Group.Request.ApplyGroupRequest;
import pit.pet.Group.Request.CreateGroupRequest;
import pit.pet.Group.Request.UpdateMemberStatusRequest;
import pit.pet.Group.Service.GroupMemberService;
import pit.pet.Group.Service.GroupService;
import pit.pet.Group.entity.GroupMemberTable;
import pit.pet.Group.entity.GroupMemberTableDto;
import pit.pet.Group.entity.GroupTable;
import pit.pet.Group.entity.GroupTableDTO;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Controller
@Slf4j
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
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));
        List<Dog> myDogs = dogRepository.findByOwner(me);

        model.addAttribute("createGroupRequest", new CreateGroupRequest());
        model.addAttribute("myDogs", myDogs);

        return "Group/Create";
    }

    @GetMapping("/api/my-dogs")
    @ResponseBody
    public ResponseEntity<?> getMyDogs(@AuthenticationPrincipal UserDetails principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        User me = userRepository.findByUemail(principal.getUsername())
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));
        List<Dog> myDogs = dogRepository.findByOwner(me);

        // DogDTO를 사용하여 필요한 데이터만 반환
        List<DogDTO> dogDtos = myDogs.stream()
                .map(DogDTO::new)  // Dog 객체를 DogDTO로 변환
                .collect(Collectors.toList());

        return ResponseEntity.ok(dogDtos);
    }

    // ✅ 1. Form submit 처리
    @PostMapping("/create")
    public String createGroup(@ModelAttribute @Valid CreateGroupRequest request,
                              @AuthenticationPrincipal UserDetails principal) {

        if (principal == null) {
            throw new RuntimeException("로그인이 필요합니다.");
        }

        User me = userRepository.findByUemail(principal.getUsername())
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));
        Dog dog = dogRepository.findById(request.getDogId())
                .orElseThrow(() -> new RuntimeException("대표 강아지를 찾을 수 없습니다."));

        // JS처럼 interest 따로 선택X, Form submit 시에는 그냥 넘어오는 걸로 가정
        if (request.getInterest() == null) {
            throw new RuntimeException("관심사(키워드)를 선택하지 않았습니다.");
        }

        groupService.createGroup(request, dog);

        return "redirect:/groups/list";
    }

    // ✅ 2. AJAX (JSON) 처리
    @PostMapping("/api/create")
    @ResponseBody
    public ResponseEntity<?> createGroupViaApi(@ModelAttribute @Valid CreateGroupRequest request,
                                               @RequestParam(value = "gimg", required = false) MultipartFile gimg,
                                               @AuthenticationPrincipal UserDetails principal) {

        if (principal == null) {
            return ResponseEntity.status(401).body("로그인이 필요합니다.");
        }

        User me = userRepository.findByUemail(principal.getUsername())
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));
        Dog dog = dogRepository.findById(request.getDogId())
                .orElseThrow(() -> new RuntimeException("대표 강아지를 찾을 수 없습니다."));

        if (request.getInterest() == null) {
            return ResponseEntity.badRequest().body("관심사(키워드)를 선택하지 않았습니다.");
        }

        // ✅ 서비스로 이미지까지 같이 넘기기
        request.setGimg(gimg);
        groupService.createGroup(request, dog);

        return ResponseEntity.ok("그룹 생성 완료!");
    }


    // 전체 그룹, 가입한 그룹 보여주기
    @GetMapping("/list")
    public String groupList(Model model,
                            @AuthenticationPrincipal UserDetails principal) {
        model.addAttribute("currentPage", "groupPage");
        // 🔥 전체 그룹 목록

        List<GroupTableDTO> groups = groupService.getAllGroups();
        model.addAttribute("groupList", groups);

        // 🔥 리더 이름 맵 만들기
        Map<Long, String> leaderNames = new HashMap<>();
        for (GroupTableDTO group : groups) {
            Long leaderGmno = group.getGleader(); // GroupMemberTable의 PK
            groupMemberRepository.findById(leaderGmno).ifPresent(member -> {
                leaderNames.put(group.getGno(), member.getDog().getDname());
            });
        }
        model.addAttribute("leaderNames", leaderNames);

        // ✅ 로그인 한 경우에만 "내 그룹" 정보 전달
        if (principal != null) {
            User me = userRepository.findByUemail(principal.getUsername())
                    .orElseThrow();
            List<Dog> myDogs = dogRepository.findByOwner(me);
            model.addAttribute("myDogs", myDogs);
            List<GroupMemberTable> myMemberships = groupMemberService.findByDogs(myDogs);
            model.addAttribute("myMemberships", myMemberships);

            // 추가: 로그인 여부도 Thymeleaf에서 사용할 수 있도록
            model.addAttribute("isAuthenticated", true);
        } else {
            // 비로그인인 경우
            model.addAttribute("isAuthenticated", false);
        }

        return "Group/Group";
    }

    @GetMapping("/api/all")
    @ResponseBody
    public List<GroupTableDTO> getAllGroups() {
        return groupService.getAllGroups();
    }

    @GetMapping("/api/my-groups")
    @ResponseBody
    public List<GroupMemberTableDto> getMyGroups(@AuthenticationPrincipal UserDetails principal) {

        if (principal == null) {
            return List.of();
        }

        User me = userRepository.findByUemail(principal.getUsername())
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));
        List<Dog> myDogs = dogRepository.findByOwner(me);
        List<GroupMemberTable> memberships = groupMemberService.findByDogs(myDogs);

        for (GroupMemberTable m : memberships) {
            System.out.println("[DEBUG] 그룹: " + m.getGroupTable().getGname() + " / 상태: " + m.getState());
        }

        List<GroupMemberTableDto> dtos = memberships.stream()
                .map(GroupMemberTableDto::new)
                .toList();

        System.out.println("[DEBUG] 반환하는 DTO 개수 = " + dtos.size());
        return dtos;
    }



    //현재 접속자 지위 확인

    @GetMapping("/{gno}/menu-status")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getGroupMenuStatus(@PathVariable Long gno, @AuthenticationPrincipal UserDetails principal) {
        // 로그인한 사용자 확인
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("error", "로그인이 필요합니다."));
        }

        // principal에서 이메일(Username) 가져오기
        String username = principal.getUsername();  // principal은 UserDetails 타입

        // 이메일을 통해 User 객체 찾기
        User me = userRepository.findByUemail(username)
                .orElseThrow(() -> new RuntimeException("해당 이메일로 가입된 사용자가 없습니다."));

        // 사용자의 강아지 목록 가져오기
        List<Dog> myDogs = dogRepository.findByOwner(me);

        // 사용자 강아지 중 리더인지 확인
        String status = groupService.checkUserStatus(gno, me.getUno());

        // 리더의 gmno 가져오기
        Long leaderGmno = groupMemberService.getLeaderGmno(gno, myDogs);

        // 결과 맵 생성
        Map<String, Object> result = new HashMap<>();
        result.put("status", status); // 사용자 상태 (LEADER, MEMBER, NOT_JOINED)
        result.put("gleader", leaderGmno); // 리더 gmno 값 반환

        return ResponseEntity.ok(result);  // 상태와 리더 정보 반환
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
    public String updateMemberStatus(
            @PathVariable Long gno,
            @PathVariable Long gmno,
            @ModelAttribute UpdateMemberStatusRequest request,
            @AuthenticationPrincipal UserDetails principal
    ) {
        groupMemberService.handleJoinRequest(gmno, request.getStatus(), principal); // principal 넘기기
        return "redirect:/groups/" + gno + "/manage";
    }


    @GetMapping("/{gno}/members")
    @ResponseBody
    public List<GroupMemberTableDto> getGroupMembers(@PathVariable Long gno) {
        List<GroupMemberTable> members = groupMemberService.getAllMembers(gno);
        // 리더 gmno 기준으로 isLeader 플래그를 dto에 같이 내려주면 프론트에서 crown 렌더에 유용
        Long leaderGmno = groupMemberService.getLeaderGmnoByGroup(gno);

        // DTO 변환 + 리더 여부 플래그 추가
        return members.stream()
                .map(m -> {
                    GroupMemberTableDto dto = new GroupMemberTableDto(m);
                    dto.setIsLeader(m.getGmno().equals(leaderGmno));
                    return dto;
                }).toList();
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
    public String groupDetail(@PathVariable Long gno, Model model, @AuthenticationPrincipal UserDetails principal) {
        GroupTable group = groupService.findById(gno);

        model.addAttribute("group", group);

        if (principal != null) {
            User me = userRepository.findByUemail(principal.getUsername()).orElse(null);
            if (me != null) {
                List<Dog> myDogs = dogRepository.findByOwner(me);
                if (myDogs != null && !myDogs.isEmpty()) {
                    // 대표 강아지를 첫 번째 강아지로 가정 (또는 Dog 엔티티에 isMain 같은 플래그가 있다면 그걸로 찾기)
                    Dog representativeDog = myDogs.get(0);
                    // DogDTO를 사용한다면 new DogDTO(representativeDog)를 모델에 추가
                    model.addAttribute("myRepresentativeDog", representativeDog);
                }
            }
        }


        return "Group/Group_board";
    }

    @GetMapping("/{gno}/pending-members")
    @ResponseBody
    public List<GroupMemberTableDto> getPendingMembers(@PathVariable Long gno) {
        // groupMemberService에서 WAIT만 필터링해서 반환하도록 구현
        List<GroupMemberTable> waitings = groupMemberService.getWaitMembers(gno);
        return waitings.stream().map(GroupMemberTableDto::new).toList();
    }


}