package pit.pet.Match;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import pit.pet.Account.Service.DogService;
import pit.pet.Account.Service.UserService;
import pit.pet.Account.Repository.DogRepository;
import pit.pet.Friend.FriendService;
import pit.pet.Match.DogLikeRepository;
import pit.pet.Account.User.Dog;
import pit.pet.Account.User.User;
import pit.pet.Match.DogLike;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Collections;
import java.util.Set;
import java.util.HashSet;

@Service
public class MatchingService {

    @Autowired
    private DogService dogService;

    @Autowired
    private UserService userService;

    @Autowired
    private DogRepository dogRepository;

    @Autowired
    private DogLikeRepository dogLikeRepository;

    @Autowired
    private FriendService friendService;

    // ===== 권한별 강아지 조회 =====

    /**
     * 모든 강아지 매칭 목록 조회 (비회원용)
     */
    public List<Dog> findAllDogsForMatching() {
        List<Dog> allDogs = dogService.findAllDogs();
        return allDogs.stream()
                .filter(this::isAvailableForMatching)
                .collect(Collectors.toList());
    }

    /**
     * 로그인 사용자용 강아지 목록 (내 강아지 + 친구 + 이미 좋아요한 강아지 제외)
     */
    public List<Dog> findDogsForLoggedInUser(String userEmail) {
        User user = userService.findByEmail(userEmail);
        if (user == null) {
            return Collections.emptyList();
        }

        // 제외할 강아지 ID들 수집
        Set<Long> excludeDogIds = getExcludeDogIds(user);

        // 전체 강아지에서 제외 대상 빼기
        return dogService.findAllDogs().stream()
                .filter(dog -> !excludeDogIds.contains(dog.getDno()))
                .filter(this::isAvailableForMatching)
                .collect(Collectors.toList());
    }

    // ===== 키워드 기반 랜덤 검색 =====

    /**
     * 키워드 기반 랜덤 강아지 조회 (비회원용)
     */
    public List<Dog> findRandomDogsByKeyword(String keyword, int limit) {
        List<Dog> keywordDogs = dogRepository.findByKeyword1Containing(keyword);
        Collections.shuffle(keywordDogs);

        return keywordDogs.stream()
                .filter(this::isAvailableForMatching)
                .limit(limit)
                .collect(Collectors.toList());
    }

    /**
     * 키워드 기반 랜덤 강아지 조회 (회원용)
     */
    public List<Dog> findRandomDogsByKeywordForUser(String keyword, String userEmail, int limit) {
        User user = userService.findByEmail(userEmail);
        if (user == null) {
            return findRandomDogsByKeyword(keyword, limit);
        }

        Set<Long> excludeDogIds = getExcludeDogIds(user);
        List<Dog> keywordDogs = dogRepository.findByKeyword1Containing(keyword);

        List<Dog> availableDogs = keywordDogs.stream()
                .filter(dog -> !excludeDogIds.contains(dog.getDno()))
                .filter(this::isAvailableForMatching)
                .collect(Collectors.toList());

        Collections.shuffle(availableDogs);
        return availableDogs.stream().limit(limit).collect(Collectors.toList());
    }

    /**
     * 전체 강아지 랜덤 조회 (비회원용)
     */
    public List<Dog> findRandomDogs(int limit) {
        List<Dog> allDogs = findAllDogsForMatching();
        Collections.shuffle(allDogs);
        return allDogs.stream().limit(limit).collect(Collectors.toList());
    }

    /**
     * 전체 강아지 랜덤 조회 (회원용)
     */
    public List<Dog> findRandomDogsForUser(String userEmail, int limit) {
        List<Dog> availableDogs = findDogsForLoggedInUser(userEmail);
        Collections.shuffle(availableDogs);
        return availableDogs.stream().limit(limit).collect(Collectors.toList());
    }

    // ===== 복합 검색 =====

    /**
     * 복합 검색 (비회원용)
     */
    public List<Dog> searchDogsForGuest(String gender, String breed, String location, String keyword1, int limit) {
        List<Dog> searchResults = dogService.searchDogs(gender, breed, location, keyword1);
        Collections.shuffle(searchResults);

        return searchResults.stream()
                .filter(this::isAvailableForMatching)
                .limit(limit)
                .collect(Collectors.toList());
    }

    /**
     * 복합 검색 (회원용)
     */
    public List<Dog> searchDogsForUser(String gender, String breed, String location, String keyword1,
                                       String userEmail, int limit) {
        User user = userService.findByEmail(userEmail);
        if (user == null) {
            return searchDogsForGuest(gender, breed, location, keyword1, limit);
        }

        Set<Long> excludeDogIds = getExcludeDogIds(user);
        List<Dog> searchResults = dogService.searchDogs(gender, breed, location, keyword1);

        List<Dog> availableDogs = searchResults.stream()
                .filter(dog -> !excludeDogIds.contains(dog.getDno()))
                .filter(this::isAvailableForMatching)
                .collect(Collectors.toList());

        Collections.shuffle(availableDogs);
        return availableDogs.stream().limit(limit).collect(Collectors.toList());
    }

    // ===== 좋아요 시스템 (3개 파라미터 버전) =====

    /**
     * 좋아요 토글 및 매칭 확인 (User, receiverDogId, senderDogId)
     */
    public boolean toggleLike(User user, Long receiverDogId, Long senderDogId) {
        // 받는 강아지 확인
        Optional<Dog> receiverDogOpt = dogService.findById(receiverDogId);
        if (!receiverDogOpt.isPresent()) {
            throw new RuntimeException("대상 강아지를 찾을 수 없습니다.");
        }
        Dog receiverDog = receiverDogOpt.get();

        // 보내는 강아지 확인
        Dog senderDog = null;
        if (senderDogId != null) {
            Optional<Dog> senderDogOpt = dogService.findById(senderDogId);
            if (senderDogOpt.isPresent() && senderDogOpt.get().getOwner().getUno().equals(user.getUno())) {
                senderDog = senderDogOpt.get();
            }
        }

        // 보내는 강아지가 없으면 첫 번째 강아지 사용
        if (senderDog == null) {
            List<Dog> myDogs = dogService.findByOwner(user);
            if (myDogs.isEmpty()) {
                throw new RuntimeException("등록된 강아지가 없습니다.");
            }
            senderDog = myDogs.get(0);
        }

        // 자기 자신에게 좋아요 방지
        if (senderDog.getDno().equals(receiverDog.getDno())) {
            throw new RuntimeException("자기 자신에게는 좋아요할 수 없습니다.");
        }

        // 같은 주인의 강아지끼리 좋아요 방지
        if (senderDog.getOwner().getUno().equals(receiverDog.getOwner().getUno())) {
            throw new RuntimeException("같은 주인의 강아지끼리는 좋아요할 수 없습니다.");
        }

        Optional<DogLike> existingLike = dogLikeRepository.findBySenderDogAndReceiverDog(senderDog, receiverDog);

        if (existingLike.isPresent()) {
            // 좋아요 취소
            dogLikeRepository.delete(existingLike.get());
            return false;
        } else {
            // 좋아요 추가
            DogLike dogLike = new DogLike();
            dogLike.setSenderDog(senderDog);
            dogLike.setReceiverDog(receiverDog);
            dogLikeRepository.save(dogLike);

            // 상호 좋아요 확인 (매칭 성사)
            boolean isMatched = checkMutualLike(senderDog, receiverDog);
            return isMatched;
        }
    }

    /**
     * 강아지가 특정 강아지를 좋아요했는지 확인
     */
    public boolean isDogLikedByDog(Dog senderDog, Dog receiverDog) {
        if (senderDog == null || receiverDog == null) return false;
        return dogLikeRepository.findBySenderDogAndReceiverDog(senderDog, receiverDog).isPresent();
    }

    /**
     * 특정 강아지가 좋아요한 강아지 목록
     */
    public List<Dog> getLikedDogsByDog(Dog senderDog) {
        List<DogLike> likes = dogLikeRepository.findBySenderDog(senderDog);
        return likes.stream()
                .map(DogLike::getReceiverDog)
                .collect(Collectors.toList());
    }

    /**
     * 매칭 성사된 목록 (특정 강아지 기준)
     */
    public List<Dog> getMatchesByDog(Dog myDog) {
        List<Dog> myLikedDogs = getLikedDogsByDog(myDog);

        return myLikedDogs.stream()
                .filter(likedDog -> isDogLikedByDog(likedDog, myDog)) // 상호 좋아요 확인
                .collect(Collectors.toList());
    }

    // ===== 헬퍼 메서드들 =====

    /**
     * 매칭 가능 여부 확인
     */
    private boolean isAvailableForMatching(Dog dog) {
        boolean isAvailable = dog != null
                && dog.getOwner() != null
                && dog.getDname() != null
                && !dog.getDname().trim().isEmpty();

        System.out.println("강아지 매칭 가능 여부 체크: " + dog.getDname() + " = " + isAvailable);
        return isAvailable;
    }

    /**
     * 제외할 강아지 ID들 수집
     */
    private Set<Long> getExcludeDogIds(User user) {
        Set<Long> excludeDogIds = new HashSet<>();

        // 내 강아지들
        List<Dog> myDogs = dogService.findByOwner(user);
        excludeDogIds.addAll(myDogs.stream().map(Dog::getDno).collect(Collectors.toSet()));

        // 친구 강아지들
        for (Dog myDog : myDogs) {
            List<Dog> friends = friendService.getFriends(myDog.getDno());
            excludeDogIds.addAll(friends.stream().map(Dog::getDno).collect(Collectors.toSet()));
        }

        // 이미 좋아요한 강아지들
        for (Dog myDog : myDogs) {
            List<Dog> likedDogs = getLikedDogsByDog(myDog);
            excludeDogIds.addAll(likedDogs.stream().map(Dog::getDno).collect(Collectors.toSet()));
        }

        return excludeDogIds;
    }

    /**
     * 상호 좋아요 확인 (매칭 성사)
     */
    private boolean checkMutualLike(Dog senderDog, Dog receiverDog) {
        // 상대방도 내 강아지에게 좋아요를 보냈는지 확인
        boolean isMatched = isDogLikedByDog(receiverDog, senderDog);

        if (isMatched) {
            // 매칭 성사 처리
            handleMatchSuccess(senderDog, receiverDog);
        }

        return isMatched;
    }

    /**
     * 매칭 성사 처리
     */
    private void handleMatchSuccess(Dog dog1, Dog dog2) {
        System.out.println("매칭 성사: " + dog1.getDname() + "(" + dog1.getOwner().getUemail() + ") <-> "
                + dog2.getDname() + "(" + dog2.getOwner().getUemail() + ")");

        // 필요하다면 여기서 FriendRequest 자동 생성 로직 추가
        // friendService.createAutoFriendRequest(dog1, dog2);
    }

    // ===== 하위 호환성을 위한 메서드들 =====

    // 기존 toggleLike 메서드 (하위 호환성) - 2개 파라미터
    public boolean toggleLike(User user, Long dogId) {
        return toggleLike(user, dogId, null);
    }

    // 사용자 기준 좋아요한 강아지 목록 (하위 호환성)
    public List<Dog> getLikedDogs(User user) {
        List<Dog> myDogs = dogService.findByOwner(user);
        return myDogs.stream()
                .flatMap(dog -> getLikedDogsByDog(dog).stream())
                .distinct()
                .collect(Collectors.toList());
    }

    // 사용자 기준 좋아요 상태 확인 (하위 호환성)
    public boolean isLikedByUser(User user, Dog targetDog) {
        List<Dog> myDogs = dogService.findByOwner(user);
        return myDogs.stream()
                .anyMatch(myDog -> isDogLikedByDog(myDog, targetDog));
    }

    // 사용자 기준 매칭 목록 (하위 호환성)
    public List<Dog> getMatches(User user) {
        List<Dog> myDogs = dogService.findByOwner(user);
        return myDogs.stream()
                .flatMap(dog -> getMatchesByDog(dog).stream())
                .distinct()
                .collect(Collectors.toList());
    }
}