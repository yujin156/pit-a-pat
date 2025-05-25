package pit.pet.Friend;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pit.pet.Account.Repository.DogRepository;
import pit.pet.Account.Repository.UserRepository;
import pit.pet.Account.User.Dog;
import pit.pet.Account.User.User;
import pit.pet.Match.DogLike;
import pit.pet.Match.DogLikeRepository; // ⚠️ 추가 필요

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/friends")
@RequiredArgsConstructor
@Slf4j
public class FriendsApiController {

    private final FriendService friendService;
    private final UserRepository userRepository;
    private final DogRepository dogRepository;
    private final FriendRequestRepository friendRequestRepository;
    private final DogLikeRepository dogLikeRepository; // ⚠️ 추가된 부분

    @GetMapping("/favorites")
    public ResponseEntity<?> getFavorites(@AuthenticationPrincipal UserDetails principal) {
        try {
            if (principal == null) {
                return ResponseEntity.ok(Map.of(
                        "success", false,
                        "message", "로그인이 필요합니다."
                ));
            }

            User currentUser = userRepository.findByUemail(principal.getUsername())
                    .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

            List<Dog> myDogs = dogRepository.findByOwner(currentUser);
            if (myDogs.isEmpty()) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "friends", List.of()
                ));
            }

            // ✅ 실제 친구들만 수집 (상호 좋아요 완료된 강아지들)
            Set<Dog> actualFriendsSet = new HashSet<>();

            for (Dog myDog : myDogs) {
                // 각 내 강아지의 실제 친구들 조회
                List<Dog> friendsOfThisDog = friendService.getFriends(myDog.getDno());

                // 상호 좋아요 확인: FriendRequest에서 ACCEPTED 상태인 것들만
                for (Dog potentialFriend : friendsOfThisDog) {
                    // Friend 테이블이 아닌 DogLike 테이블에서 상호 좋아요 확인
                    if (isActualFriend(myDog, potentialFriend)) {
                        actualFriendsSet.add(potentialFriend);
                    }
                }
            }

            List<Dog> actualFriends = new ArrayList<>(actualFriendsSet);

            System.out.println("getFavorites - 사용자: " + currentUser.getUemail());
            System.out.println("getFavorites - 내 강아지 수: " + myDogs.size());
            System.out.println("getFavorites - 실제 친구 수: " + actualFriends.size());

            // 즐겨찾기 친구들 데이터 변환 (처음 5명을 즐겨찾기로 가정)
            List<Map<String, Object>> favoriteFriendsData = actualFriends.stream()
                    .limit(5)
                    .map(friend -> {
                        Map<String, Object> friendData = new HashMap<>();
                        friendData.put("id", friend.getDno());
                        friendData.put("name", friend.getDname());

                        // 이미지 정보
                        if (friend.getImage() != null) {
                            Map<String, Object> imageData = new HashMap<>();
                            imageData.put("diurl", friend.getImage().getDiurl());
                            friendData.put("image", imageData);
                        } else {
                            friendData.put("image", null);
                        }

                        friendData.put("status", friend.getStatus() != null ? friend.getStatus() : "온라인");

                        // FriendRequest ID 찾기 (채팅용)
                        Long friendRequestId = findFriendRequestIdForActualFriend(myDogs.get(0), friend);
                        friendData.put("friendRequestId", friendRequestId);

                        System.out.println("getFavorites - 친구 추가: " + friend.getDname() + " (ID: " + friend.getDno() + ")");
                        return friendData;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "friends", favoriteFriendsData
            ));

        } catch (Exception e) {
            log.error("즐겨찾기 친구 목록 조회 실패: {}", e.getMessage());
            return ResponseEntity.ok(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * 실제 친구인지 확인 (상호 좋아요 완료)
     */
    private boolean isActualFriend(Dog myDog, Dog otherDog) {
        // DogLike 테이블에서 상호 좋아요 확인
        Optional<DogLike> myLikeToOther = dogLikeRepository.findBySenderDogAndReceiverDog(myDog, otherDog);
        Optional<DogLike> otherLikeToMe = dogLikeRepository.findBySenderDogAndReceiverDog(otherDog, myDog);

        boolean isActualFriend = myLikeToOther.isPresent() && otherLikeToMe.isPresent();

        System.out.println("친구 관계 확인: " + myDog.getDname() + " <-> " + otherDog.getDname() + " = " + isActualFriend);

        return isActualFriend;
    }

    /**
     * 실제 친구 관계의 FriendRequest ID 찾기
     */
    private Long findFriendRequestIdForActualFriend(Dog myDog, Dog friend) {
        // 양방향으로 FriendRequest 확인
        Optional<FriendRequest> request1 = friendRequestRepository.findByRequesterAndReceiver(myDog, friend);
        Optional<FriendRequest> request2 = friendRequestRepository.findByRequesterAndReceiver(friend, myDog);

        // ACCEPTED 상태인 것 우선 반환
        if (request1.isPresent() && request1.get().getStatus() == RequestStatus.ACCEPTED) {
            return request1.get().getId();
        }
        if (request2.isPresent() && request2.get().getStatus() == RequestStatus.ACCEPTED) {
            return request2.get().getId();
        }

        // 둘 다 없으면 null
        return null;
    }
}