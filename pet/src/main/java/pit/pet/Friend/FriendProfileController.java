package pit.pet.Friend;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
import pit.pet.Api.SgisRegionService;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

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
        log.info("=== 친구 프로필 상세보기 요청 - 강아지 ID: {} ===", dogId);

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

            // 모든 내 강아지의 친구들을 합쳐서 가져오기
            Set<Dog> allFriendsSet = new HashSet<>();
            Map<Long, Long> friendRequestIds = new HashMap<>();

            for (Dog myDog : myDogs) {
                List<Dog> friends = friendService.getMatchedFriends(myDog.getDno());
                allFriendsSet.addAll(friends);

                // 각 친구별 FriendRequest ID 수집
                for (Dog friend : friends) {
                    Long requestId = findFriendRequestId(myDog, friend);
                    if (requestId != null) {
                        friendRequestIds.put(friend.getDno(), requestId);
                    }
                }
            }

            List<Dog> allFriends = new ArrayList<>(allFriendsSet);

            // 선택된 강아지가 친구 목록에 있는지 확인
            Dog selectedFriend = allFriends.stream()
                    .filter(friend -> friend.getDno().equals(dogId))
                    .findFirst()
                    .orElse(null);

            if (selectedFriend == null) {
                log.warn("친구가 아닌 강아지 프로필 접근 시도: {}", dogId);
                return "redirect:/dog-friends/list?error=not_friend";
            }

            // 프로필 데이터 구성
            List<Map<String, Object>> friendProfiles = new ArrayList<>();
            for (Dog friend : allFriends) {
                Map<String, Object> profile = createDogProfile(friend);
                Long requestId = friendRequestIds.get(friend.getDno());
                profile.put("friendRequestId", requestId);
                friendProfiles.add(profile);
            }

            // 현재 선택된 강아지의 인덱스 찾기
            int currentIndex = 0;
            for (int i = 0; i < friendProfiles.size(); i++) {
                if (((Long) friendProfiles.get(i).get("id")).equals(dogId)) {
                    currentIndex = i;
                    break;
                }
            }

            Map<String, Object> currentProfile = friendProfiles.get(currentIndex);

            model.addAttribute("currentProfile", currentProfile);


            log.info("친구 프로필 데이터 전달 완료: {} (전체 친구 {}마리)",
                    currentProfile.get("name"), friendProfiles.size());

            return "Friend/Friend_profile";

        } catch (Exception e) {
            log.error("친구 프로필 로드 실패: {}", e.getMessage());
            return "redirect:/dog-friends/list?error=profile_error";
        }
    }

    private Map<String, Object> createDogProfile(Dog dog) {
        Map<String, Object> profile = new HashMap<>();

        // 기본 정보
        profile.put("id", dog.getDno());
        profile.put("name", dog.getDname() != null ? dog.getDname() : "이름 미공개");

        // 성별 정보
        String gender = "성별 미공개";
        String genderShort = "미공개";
        if (dog.getUgender() != null) {
            gender = dog.getUgender().Doglabel();
            genderShort = gender.contains("수컷") ? "수컷" : "암컷";
        }
        profile.put("gender", gender);
        profile.put("genderShort", genderShort);

        // 견종 정보 - 데이터베이스에서 직접 가져오기
        String breed = "견종 미공개";
        String size = "소형견";
        if (dog.getSpecies() != null) {
            breed = dog.getSpecies().getName();
        }
        if (dog.getSize() != null) {
            size = dog.getSize().toString();
        }
        profile.put("breed", breed);
        profile.put("size", size);

        // 생일 정보 - JDK17 호환
        String birthday = "생일 미공개";
        if (dog.getDBday() != null) {
            try {
                LocalDate birthDate = Instant.ofEpochMilli(dog.getDBday().getTime())
                        .atZone(ZoneId.systemDefault())
                        .toLocalDate();
                birthday = birthDate.getYear() + "년 " + birthDate.getMonthValue() + "월 " + birthDate.getDayOfMonth() + "일";
            } catch (Exception e) {
                birthday = "생일 정보 오류";
            }
        }
        profile.put("birthday", birthday);

        // 주소 정보
        String location = "위치 미공개";
        if (dog.getOwner() != null && dog.getOwner().getAddress() != null) {
            var addr = dog.getOwner().getAddress();
            String city = addr.getCity() != null ? addr.getCity() : "";
            String county = addr.getCounty() != null ? addr.getCounty() : "";

            try {
                String fullAddress = sgisRegionService.getFullAddress(city, county, "");
                location = fullAddress != null ? fullAddress : city + " " + county;
            } catch (Exception e) {
                location = city + " " + county;
            }
        }
        profile.put("location", location);

        // 키워드 정보
        List<String> keywords = new ArrayList<>();
        if (dog.getKeywords1() != null) {
            keywords = dog.getKeywords1().stream()
                    .map(keyword -> keyword.getDktag())
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
        }
        profile.put("keywords", keywords);

        // 강아지 소개
        String intro = dog.getDintro() != null ? dog.getDintro() : "아직 소개가 등록되지 않았습니다.";
        profile.put("intro", intro);

        // 이미지 정보
        String imageUrl = null;
        if (dog.getImage() != null && dog.getImage().getDiurl() != null) {
            imageUrl = dog.getImage().getDiurl();
        }
        profile.put("image", imageUrl);

        // 기타
        profile.put("group", "강아지 친구 모임");
        profile.put("isFavorite", false);

        return profile;
    }

    @PostMapping("/favorite")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> toggleFavorite(
            @RequestBody Map<String, Object> request,
            @AuthenticationPrincipal UserDetails principal) {

        Map<String, Object> response = new HashMap<>();

        try {
            if (principal == null) {
                response.put("success", false);
                response.put("message", "로그인이 필요합니다.");
                return ResponseEntity.ok(response);
            }

            Long dogId = Long.valueOf(request.get("dogId").toString());
            Boolean isFavorite = Boolean.valueOf(request.get("isFavorite").toString());

            response.put("success", true);
            response.put("message", isFavorite ? "즐겨찾기에 추가되었습니다." : "즐겨찾기에서 제거되었습니다.");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "즐겨찾기 처리에 실패했습니다.");
            return ResponseEntity.ok(response);
        }
    }

    @PostMapping("/delete/{dogId}")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> deleteFriend(
            @PathVariable Long dogId,
            @AuthenticationPrincipal UserDetails principal) {

        Map<String, Object> response = new HashMap<>();

        try {
            if (principal == null) {
                response.put("success", false);
                response.put("message", "로그인이 필요합니다.");
                return ResponseEntity.ok(response);
            }

            User currentUser = userRepository.findByUemail(principal.getUsername())
                    .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

            Dog targetDog = dogRepository.findById(dogId)
                    .orElseThrow(() -> new RuntimeException("강아지 정보를 찾을 수 없습니다."));

            List<Dog> myDogs = dogRepository.findByOwner(currentUser);

            boolean friendDeleted = false;
            String deletedDogName = targetDog.getDname();

            for (Dog myDog : myDogs) {
                var request1 = friendRequestRepository.findByRequesterAndReceiver(myDog, targetDog);
                var request2 = friendRequestRepository.findByRequesterAndReceiver(targetDog, myDog);

                if (request1.isPresent()) {
                    friendRequestRepository.delete(request1.get());
                    friendDeleted = true;
                }

                if (request2.isPresent()) {
                    friendRequestRepository.delete(request2.get());
                    friendDeleted = true;
                }
            }

            if (friendDeleted) {
                response.put("success", true);
                response.put("message", deletedDogName + "와의 친구 관계가 삭제되었습니다.");
            } else {
                response.put("success", false);
                response.put("message", "친구 관계를 찾을 수 없습니다.");
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "친구 삭제에 실패했습니다.");
            return ResponseEntity.ok(response);
        }
    }

    private Long findFriendRequestId(Dog myDog, Dog friend) {
        try {
            return friendRequestRepository.findByRequesterAndReceiver(myDog, friend)
                    .or(() -> friendRequestRepository.findByRequesterAndReceiver(friend, myDog))
                    .filter(request -> request.getStatus() == RequestStatus.ACCEPTED)
                    .map(FriendRequest::getId)
                    .orElse(null);
        } catch (Exception e) {
            return null;
        }
    }
}