package pit.pet.Friend;


import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import pit.pet.Account.Repository.DogProfileRepository;
import pit.pet.Account.Repository.DogRepository;
import pit.pet.Account.Repository.UserRepository;
import pit.pet.Account.User.Address;
import pit.pet.Account.User.Dog;
import pit.pet.Account.User.DogProfile;
import pit.pet.Account.User.User;
import pit.pet.Api.SgisRegionService;

import java.util.*;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/dog-friends")
@RequiredArgsConstructor
public class  DogFriendController {
    private final FriendService      friendService;
    private final DogRepository      dogRepo;
    private final UserRepository     userRepo;
    private final SgisRegionService sgisRegionService;
    /** ① 신청 폼 **/
    @GetMapping("/request")
    public String requestForm(Model model,
                              @AuthenticationPrincipal UserDetails principal) {
        User me = userRepo.findByUemail(principal.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // 1) 내 강아지 목록
        List<Dog> myDogs = dogRepo.findByOwner(me);

        // 2) 전체 강아지 목록 중 내 강아지 제외
        List<Dog> otherDogs = dogRepo.findAll().stream()
                .filter(dog -> !dog.getOwner().getUno().equals(me.getUno()))
                .collect(Collectors.toList());

        model.addAttribute("myDogs", myDogs);
        model.addAttribute("otherDogs", otherDogs);
        return "Friend/FriendRequest";
    }

    /** ② 신청 처리 **/
    @PostMapping("/request")
    public String sendRequest(@RequestParam Long requesterDno,
                              @RequestParam Long receiverDno,
                              @AuthenticationPrincipal UserDetails principal) {
        friendService.sendRequest(requesterDno, receiverDno, principal.getUsername());
        return "redirect:/dog-friends/requests";
    }

    /** ③ 받은 요청 전체 보기 **/
    @GetMapping("/requests")
    public String viewRequests(Model model,
                               @AuthenticationPrincipal UserDetails principal) {
        User me = userRepo.findByUemail(principal.getUsername())
                .orElseThrow();
        // 로그인 유저가 가진 모든 강아지의 pending 요청 합치기
        List<FriendRequest> allPending = dogRepo.findByOwner(me).stream()
                .flatMap(d -> friendService.getPendingRequests(d.getDno()).stream())
                .collect(Collectors.toList());

        model.addAttribute("requests", allPending);
        return "Friend/requests";
    }

    /** ④ 수락 **/
    @PostMapping("/accept")
    public String accept(@RequestParam Long requestId,
                         @AuthenticationPrincipal UserDetails principal) {
        friendService.acceptRequest(requestId, principal.getUsername());
        return "redirect:/dog-friends/requests";
    }

    /** ⑤ 거절 **/
    @PostMapping("/reject")
    public String reject(@RequestParam Long requestId,
                         @AuthenticationPrincipal UserDetails principal) {
        friendService.rejectRequest(requestId, principal.getUsername());
        return "redirect:/dog-friends/requests";
    }

    /** ⑥ 내 친구 목록 보기(원하시면) **/
    @GetMapping("/list")
    public String listFriends(
            @RequestParam(value = "dogId", required = false) Long dogId,
            Model model,
            @AuthenticationPrincipal UserDetails principal,
            RedirectAttributes redirectAttrs) {

        if (principal == null) {
            redirectAttrs.addFlashAttribute("errorMessage", "로그인이 필요합니다.");
            return "redirect:/";
        }

        User me = userRepo.findByUemail(principal.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        List<Dog> myDogs = dogRepo.findByOwner(me);
        model.addAttribute("myDogs", myDogs);

        // 기본 선택 강아지: 첫 번째
        if (dogId == null && !myDogs.isEmpty()) {
            dogId = myDogs.get(0).getDno();
        }
        model.addAttribute("selectedDogId", dogId);

        // dogId 있으면 그 강아지 친구만, 없으면 내 모든 강아지 친구 합집합
        List<Dog> friends = (dogId != null)
                ? friendService.getFriends(dogId)
                : friendService.getAllFriendsOfUser(me);
        model.addAttribute("friends", friends);

        // 친구별 주소 매핑 (기존 코드)
        Map<Long, String> friendAddressMap = new HashMap<>();
        for (Dog friend : friends) {
            Address addr = friend.getOwner().getAddress();
            String fullAddress = sgisRegionService.getFullAddress(
                    addr.getCity(), addr.getCounty(), addr.getTown()
            );
            friendAddressMap.put(friend.getDno(), fullAddress);
        }
        model.addAttribute("friendAddressMap", friendAddressMap);

        return "Friend/Friend";
    }


}
