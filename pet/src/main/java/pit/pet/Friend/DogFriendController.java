package pit.pet.Friend;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import pit.pet.Account.Repository.DogRepository;
import pit.pet.Account.Repository.UserRepository;
import pit.pet.Account.User.Address;
import pit.pet.Account.User.Dog;
import pit.pet.Account.User.User;
import pit.pet.Api.SgisRegionService;

import java.util.*;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/dog-friends")
@RequiredArgsConstructor
@Slf4j
public class DogFriendController {
    private final FriendService friendService;
    private final DogRepository dogRepo;
    private final UserRepository userRepo;
    private final SgisRegionService sgisRegionService;
    private final FriendRequestRepository friendRequestRepository;

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

    /** ⑥ 친구 목록 보기 (개선된 버전) **/
    @GetMapping("/list")
    public String listFriends(
            @RequestParam(value = "dogId", required = false) Long dogId,
            Model model,
            @AuthenticationPrincipal UserDetails principal) {

        log.info("=== 친구 목록 조회 시작 ===");

        if (principal == null) {
            return "Account/Login";
        }

        try {
            User me = userRepo.findByUemail(principal.getUsername())
                    .orElseThrow(() -> new RuntimeException("사용자 정보를 찾을 수 없습니다."));

            log.info("현재 사용자: {}", me.getUemail());

            List<Dog> myDogs = dogRepo.findByOwner(me);
            log.info("내 강아지 수: {}", myDogs.size());

            if (myDogs.isEmpty()) {
                log.warn("등록된 강아지가 없음");
                model.addAttribute("error", "등록된 강아지가 없습니다. 먼저 강아지를 등록해주세요.");
                return "redirect:/dog/register";
            }

            // 내 강아지 데이터를 안전하게 변환
            List<Map<String, Object>> userDogsData = new ArrayList<>();
            for (Dog dog : myDogs) {
                Map<String, Object> dogData = new HashMap<>();
                dogData.put("dno", dog.getDno());
                dogData.put("dname", dog.getDname() != null ? dog.getDname() : "이름 미공개");

                if (dog.getSpecies() != null && dog.getSpecies().getName() != null) {
                    dogData.put("speciesName", dog.getSpecies().getName());
                } else {
                    dogData.put("speciesName", "견종 미공개");
                }

                // 이미지 정보 추가
                if (dog.getImage() != null && dog.getImage().getDiurl() != null && !dog.getImage().getDiurl().trim().isEmpty()) {
                    Map<String, Object> imageData = new HashMap<>();
                    imageData.put("diurl", dog.getImage().getDiurl());
                    dogData.put("image", imageData);
                } else {
                    dogData.put("image", null);
                }
                userDogsData.add(dogData);
            }

            model.addAttribute("userDogs", userDogsData);
            model.addAttribute("isLoggedIn", true);
            model.addAttribute("showProfileSelector", myDogs.size() >= 2);

            if (dogId == null) {
                dogId = myDogs.get(0).getDno();
            }

            Long finalDogId = dogId;

            Dog selectedDog = myDogs.stream()
                    .filter(dog -> dog.getDno().equals(finalDogId))
                    .findFirst()
                    .orElse(myDogs.get(0));

            dogId = selectedDog.getDno();
            model.addAttribute("selectedDogId", dogId);

            log.info("선택된 강아지: {} (ID: {})", selectedDog.getDname(), dogId);

            // ✅ 실제 친구 데이터 조회
            List<Dog> friends = friendService.getMatchedFriends(dogId);
            log.info("매칭된 친구 수: {}", friends.size());

            // ✅ 실제 Dog 엔티티를 모델에 직접 전달 (Thymeleaf가 처리할 수 있도록)
            model.addAttribute("friends", friends);

            // ✅ 주소 맵 생성
            Map<Long, String> friendAddressMap = new HashMap<>();
            for (Dog friend : friends) {
                try {
                    if (friend.getOwner() != null && friend.getOwner().getAddress() != null) {
                        Address addr = friend.getOwner().getAddress();
                        String city = addr.getCity() != null ? addr.getCity() : "";
                        String county = addr.getCounty() != null ? addr.getCounty() : "";
                        String town = addr.getTown() != null ? addr.getTown() : "";

                        String fullAddress = sgisRegionService.getFullAddress(city, county, town);
                        if (fullAddress != null && !fullAddress.trim().isEmpty()) {
                            friendAddressMap.put(friend.getDno(), fullAddress);
                        } else {
                            friendAddressMap.put(friend.getDno(), city + " " + county);
                        }
                    } else {
                        friendAddressMap.put(friend.getDno(), "위치 미공개");
                    }
                } catch (Exception e) {
                    log.warn("주소 처리 오류 (강아지 ID: {}): {}", friend.getDno(), e.getMessage());
                    friendAddressMap.put(friend.getDno(), "위치 미공개");
                }
            }
            model.addAttribute("friendAddressMap", friendAddressMap);

            // ✅ FriendRequest ID 맵 생성
            Map<Long, Long> friendRequestIds = new HashMap<>();
            for (Dog friend : friends) {
                try {
                    Long friendRequestId = findFriendRequestId(selectedDog, friend);
                    if (friendRequestId != null) {
                        friendRequestIds.put(friend.getDno(), friendRequestId);
                        log.info("친구 {} - FriendRequest ID: {}", friend.getDname(), friendRequestId);
                    } else {
                        log.warn("친구 {} - FriendRequest ID를 찾을 수 없음", friend.getDname());
                        friendRequestIds.put(friend.getDno(), null);
                    }
                } catch (Exception e) {
                    log.error("FriendRequest ID 조회 오류 (강아지 ID: {}): {}", friend.getDno(), e.getMessage());
                    friendRequestIds.put(friend.getDno(), null);
                }
            }
            model.addAttribute("friendRequestIds", friendRequestIds);

            log.info("=== 친구 목록 조회 완료 ===");
            log.info("전달된 데이터 - 친구 수: {}, 주소 맵: {}, Request ID 맵: {}",
                    friends.size(), friendAddressMap.size(), friendRequestIds.size());

            return "Friend/Friend";

        } catch (Exception e) {
            log.error("친구 목록 조회 실패: {}", e.getMessage());
            e.printStackTrace();
            model.addAttribute("error", "친구 목록을 불러오는데 실패했습니다.");
            model.addAttribute("friends", Collections.emptyList());
            model.addAttribute("userDogs", Collections.emptyList());
            model.addAttribute("isLoggedIn", false);
            model.addAttribute("showProfileSelector", false);
            model.addAttribute("friendAddressMap", Collections.emptyMap());
            model.addAttribute("friendRequestIds", Collections.emptyMap());
            return "Friend/Friend";
        }
    }

    /**
     * AJAX로 친구 목록 갱신 API
     */
    @GetMapping("/api/list")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> getFriendsList(
            @RequestParam Long dogId,
            @AuthenticationPrincipal UserDetails principal) {

        Map<String, Object> response = new HashMap<>();

        try {
            if (principal == null) {
                response.put("success", false);
                response.put("message", "로그인이 필요합니다.");
                return ResponseEntity.ok(response);
            }

            User me = userRepo.findByUemail(principal.getUsername())
                    .orElseThrow(() -> new RuntimeException("사용자 정보를 찾을 수 없습니다."));

            List<Dog> myDogs = dogRepo.findByOwner(me);
            Dog selectedDog = myDogs.stream()
                    .filter(dog -> dog.getDno().equals(dogId))
                    .findFirst()
                    .orElse(null);

            if (selectedDog == null) {
                response.put("success", false);
                response.put("message", "선택된 강아지를 찾을 수 없습니다.");
                return ResponseEntity.ok(response);
            }

            List<Dog> friends = friendService.getMatchedFriends(dogId);

            // 친구 데이터 변환
            List<Map<String, Object>> friendsData = new ArrayList<>();
            Map<Long, String> friendAddressMap = new HashMap<>();
            Map<Long, Long> friendRequestIds = new HashMap<>();

            for (Dog friend : friends) {
                Map<String, Object> friendData = new HashMap<>();
                friendData.put("dno", friend.getDno());
                friendData.put("dname", friend.getDname() != null ? friend.getDname() : "이름 미공개");

                // 성별 정보
                if (friend.getUgender() != null) {
                    friendData.put("ugender", Map.of("doglabel", friend.getUgender().Doglabel()));
                } else {
                    friendData.put("ugender", Map.of("doglabel", "성별 미공개"));
                }

                // 견종 정보
                if (friend.getSpecies() != null && friend.getSpecies().getName() != null) {
                    friendData.put("species", Map.of("name", friend.getSpecies().getName()));
                } else {
                    friendData.put("species", Map.of("name", "견종 미공개"));
                }

                // 이미지 정보
                if (friend.getImage() != null && friend.getImage().getDiurl() != null && !friend.getImage().getDiurl().trim().isEmpty()) {
                    friendData.put("image", Map.of("diurl", friend.getImage().getDiurl()));
                } else {
                    friendData.put("image", null);
                }

                friendsData.add(friendData);

                // 주소 정보
                if (friend.getOwner() != null && friend.getOwner().getAddress() != null) {
                    Address addr = friend.getOwner().getAddress();
                    String city = addr.getCity() != null ? addr.getCity() : "";
                    String county = addr.getCounty() != null ? addr.getCounty() : "";
                    String town = addr.getTown() != null ? addr.getTown() : "";

                    String fullAddress = sgisRegionService.getFullAddress(city, county, town);
                    if (fullAddress != null && !fullAddress.trim().isEmpty()) {
                        friendAddressMap.put(friend.getDno(), fullAddress);
                    } else {
                        friendAddressMap.put(friend.getDno(), city + " " + county);
                    }
                } else {
                    friendAddressMap.put(friend.getDno(), "위치 미공개");
                }

                // FriendRequest ID
                Long friendRequestId = findFriendRequestId(selectedDog, friend);
                friendRequestIds.put(friend.getDno(), friendRequestId);
            }

            response.put("success", true);
            response.put("friends", friendsData);
            response.put("friendAddressMap", friendAddressMap);
            response.put("friendRequestIds", friendRequestIds);
            response.put("selectedDogName", selectedDog.getDname());
            response.put("friendCount", friends.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("친구 목록 API 조회 실패: {}", e.getMessage());
            response.put("success", false);
            response.put("message", "친구 목록을 불러오는데 실패했습니다.");
            return ResponseEntity.ok(response);
        }
    }

    /**
     * ✅ FriendRequest ID 찾기 (채팅용) - 개선된 버전
     */
    private Long findFriendRequestId(Dog myDog, Dog friend) {
        try {
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

            // ACCEPTED가 아닌 경우도 반환 (디버깅용)
            if (request1.isPresent()) {
                log.debug("FriendRequest 상태: {} (ID: {})", request1.get().getStatus(), request1.get().getId());
                return request1.get().getId();
            }
            if (request2.isPresent()) {
                log.debug("FriendRequest 상태: {} (ID: {})", request2.get().getStatus(), request2.get().getId());
                return request2.get().getId();
            }

            return null;
        } catch (Exception e) {
            log.error("FriendRequest ID 조회 오류: {}", e.getMessage());
            return null;
        }
    }
}