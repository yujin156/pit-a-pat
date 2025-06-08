package pit.pet.Match;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import pit.pet.Account.Service.DogService;
import pit.pet.Account.Service.UserService;
import pit.pet.Account.Repository.DogKeyword1Repository;
import pit.pet.Account.User.Dog;
import pit.pet.Account.User.User;
import pit.pet.Account.User.DogKeyword1;
import pit.pet.Api.SgisRegionService; // ✅ 추가

import java.util.*;

@Controller
@RequestMapping("/matching")
@Slf4j
public class MatchingController {

    @Autowired
    private DogService dogService;

    @Autowired
    private UserService userService;

    @Autowired
    private DogKeyword1Repository keyword1Repository;

    @Autowired
    private MatchingService matchingService;

    @Autowired
    private SgisRegionService sgisRegionService; // ✅ 추가

    /**
     * 매칭 페이지 메인
     */
    @GetMapping
    public String matchingPage(@AuthenticationPrincipal UserDetails principal, Model model) {
        model.addAttribute("currentPage", "matchingPage");
        try {
            // 기본값들을 먼저 설정
            model.addAttribute("isLoggedIn", false);
            model.addAttribute("userDogs", Collections.emptyList());
            model.addAttribute("showProfileSelector", false);
            model.addAttribute("matchingDogs", Collections.emptyList());
            model.addAttribute("keywords", Collections.emptyList());

            boolean isLoggedIn = (principal != null);
            model.addAttribute("isLoggedIn", isLoggedIn);

            System.out.println("=== 매칭 페이지 로드 시작 ===");
            System.out.println("로그인 상태: " + isLoggedIn);

            // 안전한 기본값 설정
            List<Map<String, Object>> userDogsData = new ArrayList<>();
            boolean showProfileSelector = false;

            if (isLoggedIn) {
                try {
                    User user = userService.findByEmail(principal.getUsername());
                    System.out.println("사용자 조회 결과: " + (user != null ? user.getUemail() : "null"));

                    if (user != null) {
                        List<Dog> userDogs = dogService.findByOwner(user);
                        System.out.println("사용자 강아지 수: " + userDogs.size());
                        showProfileSelector = userDogs.size() >= 2;

                        // Dog 엔티티를 Map으로 변환하여 순환 참조 방지
                        for (Dog dog : userDogs) {
                            if (dog != null && dog.getDno() != null && dog.getDname() != null) {
                                Map<String, Object> dogData = new HashMap<>();
                                dogData.put("dno", dog.getDno());
                                dogData.put("dname", dog.getDname());
                                if (dog.getSpecies() != null) {
                                    dogData.put("speciesName", dog.getSpecies().getName());
                                }
                                // 이미지 정보 추가
                                if (dog.getImage() != null) {
                                    Map<String, Object> imageData = new HashMap<>();
                                    imageData.put("diurl", dog.getImage().getDiurl());
                                    dogData.put("image", imageData);
                                }
                                userDogsData.add(dogData);
                                System.out.println("매칭페이지 - 내 강아지 추가: " + dog.getDname());
                            }
                        }
                    }
                } catch (Exception e) {
                    System.err.println("사용자 정보 로드 중 오류: " + e.getMessage());
                    e.printStackTrace();
                }
            }

            model.addAttribute("userDogs", userDogsData);
            model.addAttribute("showProfileSelector", showProfileSelector);

            // 매칭용 강아지 목록 로드 (다른 사용자의 강아지들)
            List<Map<String, Object>> matchingDogsData = new ArrayList<>();
            try {
                List<Dog> matchingDogs;
                if (isLoggedIn) {
                    matchingDogs = matchingService.findDogsForLoggedInUser(principal.getUsername());
                } else {
                    matchingDogs = matchingService.findAllDogsForMatching();
                }

                System.out.println("매칭 강아지 수: " + (matchingDogs != null ? matchingDogs.size() : 0));

                // Dog 엔티티를 Map으로 변환
                if (matchingDogs != null) {
                    for (Dog dog : matchingDogs) {
                        if (dog != null) {
                            try {
                                Map<String, Object> dogData = convertDogToSafeMap(dog);
                                matchingDogsData.add(dogData);
                                System.out.println("강아지 변환 완료: " + dog.getDname());
                            } catch (Exception e) {
                                System.err.println("강아지 변환 중 오류 (ID: " + dog.getDno() + "): " + e.getMessage());
                            }
                        }
                    }
                }
            } catch (Exception e) {
                System.err.println("매칭 강아지 목록 로드 중 오류: " + e.getMessage());
                e.printStackTrace();
            }

            System.out.println("최종 강아지 데이터 수: " + matchingDogsData.size());
            model.addAttribute("matchingDogs", matchingDogsData);

            // 키워드 목록 로드
            List<Map<String, Object>> keywordsData = new ArrayList<>();
            try {
                List<DogKeyword1> keywords = keyword1Repository.findAllByOrderByDktagAsc();
                System.out.println("키워드 수: " + (keywords != null ? keywords.size() : 0));

                if (keywords != null) {
                    for (DogKeyword1 keyword : keywords) {
                        if (keyword != null && keyword.getDktag() != null) {
                            Map<String, Object> keywordData = new HashMap<>();
                            keywordData.put("dkno", keyword.getDkno());
                            keywordData.put("dktag", keyword.getDktag());
                            keywordsData.add(keywordData);
                        }
                    }
                }
            } catch (Exception e) {
                System.err.println("키워드 목록 로드 중 오류: " + e.getMessage());
                e.printStackTrace();
            }

            model.addAttribute("keywords", keywordsData);
            System.out.println("=== 매칭 페이지 로드 완료 ===");

            return "Match/Match";

        } catch (Exception e) {
            System.err.println("매칭 페이지 로드 중 전체 오류: " + e.getMessage());
            e.printStackTrace();

            // 완전 안전한 기본값 설정
            model.addAttribute("isLoggedIn", false);
            model.addAttribute("userDogs", Collections.emptyList());
            model.addAttribute("showProfileSelector", false);
            model.addAttribute("matchingDogs", Collections.emptyList());
            model.addAttribute("keywords", Collections.emptyList());


            return "Match/Match";
        }
    }

    /**
     * ✅ Dog 엔티티를 안전한 Map으로 변환 (주소 변환 추가)
     */
    private Map<String, Object> convertDogToSafeMap(Dog dog) {
        Map<String, Object> dogData = new HashMap<>();

        try {
            dogData.put("dno", dog.getDno());
            dogData.put("dname", dog.getDname());

            if (dog.getUgender() != null) {
                dogData.put("ugender", Map.of("doglabel", dog.getUgender().Doglabel()));
            }

            if (dog.getSpecies() != null) {
                dogData.put("species", Map.of("name", dog.getSpecies().getName()));
            }

            // ✅ 주소 정보 안전하게 변환 (SgisRegionService 사용)
            if (dog.getOwner() != null && dog.getOwner().getAddress() != null) {
                Map<String, Object> addressData = new HashMap<>();

                try {
                    // SgisRegionService를 사용해서 실제 주소로 변환
                    String fullAddress = sgisRegionService.getFullAddress(
                            dog.getOwner().getAddress().getCity(),
                            dog.getOwner().getAddress().getCounty(),
                            dog.getOwner().getAddress().getTown()
                    );

                    // 변환된 주소가 비어있거나 null이면 기본값 사용
                    if (fullAddress == null || fullAddress.trim().isEmpty()) {
                        fullAddress = "위치 미공개";
                    }

                    addressData.put("city", dog.getOwner().getAddress().getCity());
                    addressData.put("county", dog.getOwner().getAddress().getCounty());
                    addressData.put("fullAddress", fullAddress);


                } catch (Exception e) {
                    // 주소 변환 실패 시 기본값
                    addressData.put("city", "위치");
                    addressData.put("county", "미공개");
                    addressData.put("fullAddress", "위치 미공개");
                }

                dogData.put("owner", Map.of("address", addressData));
            } else {
                // 주소가 없는 경우 기본값 설정
                Map<String, Object> addressData = new HashMap<>();
                addressData.put("city", "위치");
                addressData.put("county", "미공개");
                addressData.put("fullAddress", "위치 미공개");
                dogData.put("owner", Map.of("address", addressData));
            }

            // 키워드 정보 처리
            if (dog.getKeywords1() != null && !dog.getKeywords1().isEmpty()) {
                List<Map<String, Object>> keywordsData = new ArrayList<>();
                for (DogKeyword1 keyword : dog.getKeywords1()) {
                    if (keyword != null && keyword.getDktag() != null) {
                        keywordsData.add(Map.of("dktag", keyword.getDktag()));
                    }
                }
                dogData.put("keywords1", keywordsData);
            } else {
                dogData.put("keywords1", new ArrayList<>());
            }

            // 이미지 정보 처리
            if (dog.getImage() != null && dog.getImage().getDiurl() != null) {
                dogData.put("image", Map.of("diurl", dog.getImage().getDiurl()));
            } else {
                dogData.put("image", null);
            }

        } catch (Exception e) {
            System.err.println("Dog 변환 중 오류 (ID: " + dog.getDno() + "): " + e.getMessage());
            e.printStackTrace();
        }

        return dogData;
    }

    /**
     * 키워드별 랜덤 강아지 검색 API
     */
    @GetMapping("/search/keywords")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> searchByMultipleKeywords(
            @RequestParam List<String> keywords,
            @RequestParam(defaultValue = "20") int limit,
            @AuthenticationPrincipal UserDetails principal) {

        try {
            boolean isLoggedIn = (principal != null);
            List<Dog> dogs;

            if (isLoggedIn) {
                dogs = matchingService.findRandomDogsByMultipleKeywordsForUser(keywords, principal.getUsername(), limit);
            } else {
                dogs = matchingService.findRandomDogsByMultipleKeywords(keywords, limit);
            }

            List<Map<String, Object>> safeDogsData = new ArrayList<>();
            for (Dog dog : dogs) {
                safeDogsData.add(convertDogToSafeMap(dog));
            }

            return ResponseEntity.ok(safeDogsData);
        } catch (Exception e) {
            System.err.println("다중 키워드 검색 오류: " + e.getMessage());
            return ResponseEntity.ok(Collections.emptyList());
        }
    }

    @GetMapping("/autocomplete")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> autocompleteSpecies(
            @RequestParam String keyword) {
        try {
            if (keyword == null || keyword.trim().isEmpty()) {
                return ResponseEntity.ok(Collections.emptyList());
            }

            List<String> matched = dogService.searchSpeciesNames(keyword.trim());

            List<Map<String, Object>> response = new ArrayList<>();
            for (String name : matched) {
                response.add(Map.of("id", name, "name", name));
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("견종 자동완성 실패: {}", e.getMessage());
            return ResponseEntity.ok(Collections.emptyList());
        }
    }


    /**
     * 전체 강아지 랜덤 조회 API
     */
    @GetMapping("/search/all")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> getAllDogs(
            @RequestParam(defaultValue = "10") int limit,
            @AuthenticationPrincipal UserDetails principal) {

        try {
            boolean isLoggedIn = (principal != null);
            List<Dog> dogs;

            if (isLoggedIn) {
                dogs = matchingService.findRandomDogsForUser(principal.getUsername(), limit);
            } else {
                dogs = matchingService.findRandomDogs(limit);
            }

            List<Map<String, Object>> safeDogsData = new ArrayList<>();
            for (Dog dog : dogs) {
                safeDogsData.add(convertDogToSafeMap(dog));
            }

            return ResponseEntity.ok(safeDogsData);
        } catch (Exception e) {
            System.err.println("전체 조회 중 오류: " + e.getMessage());
            return ResponseEntity.ok(Collections.emptyList());
        }
    }

    /**
     * 복합 검색 API
     */
    @GetMapping("/search")
    @ResponseBody
    public ResponseEntity<List<Map<String, Object>>> searchDogs(
            @RequestParam(name = "ugender", required = false) String gender,
            @RequestParam(name = "speciesId", required = false) String speciesId, // breed -> speciesId로 수정
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String county,
            @RequestParam(required = false) String town,
            @RequestParam(required = false) String keyword1,
            @RequestParam(defaultValue = "10") int limit,
            @AuthenticationPrincipal UserDetails principal) {

        try {
            boolean isLoggedIn = (principal != null);
            List<Dog> dogs;

            if (isLoggedIn) {
                dogs = matchingService.searchDogsForUser(
                        gender, speciesId, city, county, town, keyword1, principal.getUsername(), limit); // breed -> speciesId
            } else {
                dogs = matchingService.searchDogsForGuest(
                        gender, speciesId, city, county, town, keyword1, limit); // breed -> speciesId
            }

            List<Map<String, Object>> safeDogsData = new ArrayList<>();
            for (Dog dog : dogs) {
                safeDogsData.add(convertDogToSafeMap(dog));
            }

            return ResponseEntity.ok(safeDogsData);
        } catch (Exception e) {
            System.err.println("복합 검색 중 오류: " + e.getMessage());
            return ResponseEntity.ok(Collections.emptyList());
        }
    }

    /**
     * 좋아요/패스 API
     */
    @PostMapping("/swipe")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> handleSwipe(
            @RequestParam Long dogId,
            @RequestParam String action,
            @RequestParam(required = false) Long myDogId,
            @AuthenticationPrincipal UserDetails principal) {

        Map<String, Object> response = new HashMap<>();

        try {
            if (principal == null) {
                response.put("success", false);
                response.put("message", "로그인이 필요합니다.");
                response.put("requireLogin", true);
                return ResponseEntity.ok(response);
            }

            User user = userService.findByEmail(principal.getUsername());
            if (user == null) {
                response.put("success", false);
                response.put("message", "사용자를 찾을 수 없습니다.");
                return ResponseEntity.ok(response);
            }

            // 내 강아지 확인
            Dog myDog = null;
            if (myDogId != null) {
                Optional<Dog> myDogOpt = dogService.findById(myDogId);
                if (myDogOpt.isPresent() && myDogOpt.get().getOwner().getUno().equals(user.getUno())) {
                    myDog = myDogOpt.get();
                }
            }

            // 강아지가 선택되지 않았으면 첫 번째 강아지 사용
            if (myDog == null) {
                List<Dog> myDogs = dogService.findByOwner(user);
                if (myDogs.isEmpty()) {
                    response.put("success", false);
                    response.put("message", "등록된 강아지가 없습니다.");
                    return ResponseEntity.ok(response);
                }
                myDog = myDogs.get(0);
            }

            if ("like".equals(action)) {
                // MatchingService의 toggleLike 메서드 사용
                boolean isMatched = matchingService.toggleLike(user, dogId, myDog.getDno());

                response.put("success", true);
                response.put("action", "like");
                response.put("isMatched", isMatched);
                response.put("message", isMatched ? "매칭 성사! 친구가 되었습니다!" : "좋아요를 보냈습니다.");
                response.put("dogId", dogId);
                response.put("myDogId", myDog.getDno());

            } else if ("pass".equals(action)) {
                response.put("success", true);
                response.put("action", "pass");
                response.put("message", "패스했습니다.");
            } else {
                response.put("success", false);
                response.put("message", "잘못된 액션입니다.");
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("스와이프 처리 중 오류: {}", e.getMessage());
            response.put("success", false);
            response.put("message", "오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
    }
}