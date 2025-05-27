package pit.pet.Friend;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import pit.pet.Account.Repository.DogRepository;
import pit.pet.Account.Repository.UserRepository;
import pit.pet.Account.User.Dog;
import pit.pet.Account.User.User;
import pit.pet.Api.SgisRegionService;

import java.util.List;

@Controller
@RequestMapping("/friend")
@RequiredArgsConstructor
@Slf4j
public class FriendProfileController {

    private final FriendService friendService;
    private final DogRepository dogRepository;
    private final UserRepository userRepository;
    private final FriendRequestRepository friendRequestRepository;
    private final SgisRegionService sgisRegionService;

    @GetMapping("/profile/{dogId}")
    public String showFriendProfile(@PathVariable Long dogId,
                                    @AuthenticationPrincipal UserDetails principal,
                                    Model model) {
        try {
            if (principal == null) {
                return "redirect:/user/login";
            }

            User currentUser = userRepository.findByUemail(principal.getUsername())
                    .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

            List<Dog> myDogs = dogRepository.findByOwner(currentUser);
            if (myDogs.isEmpty()) {
                return "redirect:/dog/register";
            }

            Dog myDog = myDogs.get(0);
            List<Dog> allFriends = friendService.getFriends(myDog.getDno());

            // 선택된 강아지가 친구 목록에 있는지 확인
            Dog selectedFriend = allFriends.stream()
                    .filter(friend -> friend.getDno().equals(dogId))
                    .findFirst()
                    .orElse(null);

            if (selectedFriend == null) {
                return "redirect:/dog-friends/list";
            }

            // 현재 강아지의 인덱스 찾기
            int currentIndex = allFriends.indexOf(selectedFriend);

            // 주소 정보 가져오기
            String fullAddress = "";
            if (selectedFriend.getOwner().getAddress() != null) {
                fullAddress = sgisRegionService.getFullAddress(
                        selectedFriend.getOwner().getAddress().getCity(),
                        selectedFriend.getOwner().getAddress().getCounty(),
                        selectedFriend.getOwner().getAddress().getTown()
                );
            }

            // FriendRequest ID 찾기
            Long friendRequestId = findFriendRequestId(myDog, selectedFriend);

            model.addAttribute("currentFriend", selectedFriend);
            model.addAttribute("allFriends", allFriends);
            model.addAttribute("currentIndex", currentIndex);
            model.addAttribute("fullAddress", fullAddress);
            model.addAttribute("friendRequestId", friendRequestId);
            model.addAttribute("totalFriends", allFriends.size());

            return "Friend/Friend_profile";

        } catch (Exception e) {
            log.error("친구 프로필 로드 실패: {}", e.getMessage());
            return "redirect:/dog-friends/list";
        }
    }

    private Long findFriendRequestId(Dog myDog, Dog friend) {
        return friendRequestRepository.findByRequesterAndReceiver(myDog, friend)
                .or(() -> friendRequestRepository.findByRequesterAndReceiver(friend, myDog))
                .map(FriendRequest::getId)
                .orElse(null);
    }
}