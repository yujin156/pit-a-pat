package pit.pet.Match;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pit.pet.Account.Repository.DogRepository;
import pit.pet.Account.Repository.UserRepository;
import pit.pet.Account.User.Dog;
import pit.pet.Account.User.User;
import pit.pet.Friend.FriendRequest;
import pit.pet.Friend.FriendRequestRepository;
import pit.pet.Friend.RequestStatus;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MatchingService {

    private final DogRepository dogRepository;
    private final UserRepository userRepository;
    private final DogLikeRepository dogLikeRepository;
    private final FriendRequestRepository friendRequestRepository;

    /**
     * 좋아요 토글 - 매칭의 핵심 메서드
     */
    @Transactional
    public boolean toggleLike(User currentUser, Long targetDogId, Long myDogId) {
        log.info("=== 좋아요 처리 시작 ===");
        log.info("현재 사용자: {}", currentUser.getUemail());
        log.info("내 강아지 ID: {}, 대상 강아지 ID: {}", myDogId, targetDogId);

        try {
            // 1. 내 강아지 확인
            Dog myDog = dogRepository.findById(myDogId)
                    .orElseThrow(() -> new RuntimeException("내 강아지를 찾을 수 없습니다."));
            log.info("내 강아지 찾기 성공: {} (ID: {})", myDog.getDname(), myDog.getDno());

            // 2. 대상 강아지 확인
            Dog targetDog = dogRepository.findById(targetDogId)
                    .orElseThrow(() -> new RuntimeException("대상 강아지를 찾을 수 없습니다."));
            log.info("대상 강아지 찾기 성공: {} (ID: {})", targetDog.getDname(), targetDog.getDno());

            // 3. 본인 강아지인지 확인
            if (!myDog.getOwner().getUno().equals(currentUser.getUno())) {
                throw new RuntimeException("본인의 강아지가 아닙니다.");
            }
            log.info("소유권 확인 완료");

            // 4. 자기 자신에게 좋아요 방지
            if (myDog.getDno().equals(targetDog.getDno())) {
                throw new RuntimeException("자기 자신에게는 좋아요할 수 없습니다.");
            }
            log.info("✅ 자기 자신 체크 완료");

            // 5. 기존 좋아요 기록 확인
            log.info("🔍 기존 좋아요 기록 확인 중...");
            Optional<DogLike> existingLike = dogLikeRepository
                    .findBySenderDogAndReceiverDog(myDog, targetDog);

            if (existingLike.isPresent()) {
                log.warn("⚠️ 이미 좋아요한 강아지입니다!");
                log.warn("기존 좋아요 ID: {}", existingLike.get().getLikeId());
                log.warn("{} -> {} (이미 존재)", myDog.getDname(), targetDog.getDname());
                return false;
            }
            log.info("새로운 좋아요 가능");

            // 6. 새로운 좋아요 저장
            log.info("💖 새로운 좋아요 저장 시작...");
            DogLike newLike = new DogLike();
            newLike.setSenderDog(myDog);
            newLike.setReceiverDog(targetDog);

            log.info("🔥 DogLike 객체 생성 완료");
            log.info("- Sender: {} (ID: {})", myDog.getDname(), myDog.getDno());
            log.info("- Receiver: {} (ID: {})", targetDog.getDname(), targetDog.getDno());

            // 실제 저장
            DogLike savedLike = dogLikeRepository.save(newLike);
            log.info("✅ 좋아요 저장 성공!");
            log.info("저장된 좋아요 ID: {}", savedLike.getLikeId());
            log.info("저장 시간: {}", savedLike.getCreatedAt());

            // 7. 저장 직후 즉시 확인
            log.info("🔍 저장 직후 확인...");
            Optional<DogLike> savedCheck = dogLikeRepository
                    .findBySenderDogAndReceiverDog(myDog, targetDog);
            if (savedCheck.isPresent()) {
                log.info("✅ 저장 확인 성공! ID: {}", savedCheck.get().getLikeId());
            } else {
                log.error("❌ 저장 확인 실패! 트랜잭션 문제일 수 있음");
            }

            // 8. 전체 좋아요 개수 확인
            long totalLikes = dogLikeRepository.count();
            log.info("📊 현재 전체 좋아요 개수: {}", totalLikes);

            // 9. 상대방이 나에게 좋아요했는지 확인 (상호 좋아요)
            log.info("💕 상호 좋아요 확인 중...");
            Optional<DogLike> reverseLike = dogLikeRepository
                    .findBySenderDogAndReceiverDog(targetDog, myDog);

            boolean isMatched = reverseLike.isPresent();
            log.info("상호 좋아요 결과: {}", isMatched ? "✅ 매칭됨" : "❌ 단방향");

            if (isMatched) {
                log.info("🎉 매칭 성사! 🎉");
                log.info("매칭된 강아지들: {} ↔ {}", myDog.getDname(), targetDog.getDname());

                // 상대방 좋아요 정보도 로그
                log.info("상대방 좋아요 ID: {}", reverseLike.get().getLikeId());
                log.info("상대방 좋아요 시간: {}", reverseLike.get().getCreatedAt());

                // 친구 관계 생성
                createFriendshipIfNotExists(myDog, targetDog);
                printMatchingStats(myDog, targetDog);
            } else {
                log.info("💌 좋아요 전송 완료 (매칭 대기 중)");
                log.info("{} -> {} 에게 좋아요를 보냈습니다", myDog.getDname(), targetDog.getDname());
            }

            log.info("=== 좋아요 처리 완료 ===");
            return isMatched;

        } catch (Exception e) {
            log.error("💥 좋아요 처리 중 오류 발생: {}", e.getMessage());
            log.error("스택 트레이스: ", e);
            throw e;
        }
    }

    /**
     * 친구 관계 생성
     */
    private void createFriendshipIfNotExists(Dog dog1, Dog dog2) {
        log.info("👫 친구 관계 생성 시작...");

        // 이미 친구 관계가 있는지 확인
        Optional<FriendRequest> existingFriendship = friendRequestRepository
                .findByRequesterAndReceiver(dog1, dog2)
                .or(() -> friendRequestRepository.findByRequesterAndReceiver(dog2, dog1));

        if (existingFriendship.isEmpty()) {
            FriendRequest friendRequest = FriendRequest.builder()
                    .requester(dog1)
                    .receiver(dog2)
                    .status(RequestStatus.ACCEPTED) // 상호 좋아요시 바로 ACCEPTED
                    .requestedAt(LocalDateTime.now())
                    .build();

            FriendRequest savedFriendship = friendRequestRepository.save(friendRequest);

            log.info("✅ 친구 관계 생성 완료!");
            log.info("친구 관계 ID: {}", savedFriendship.getId());
            log.info("친구: {} ↔ {}", dog1.getDname(), dog2.getDname());
            log.info("상태: {}", savedFriendship.getStatus());
        } else {
            log.info("👫 이미 친구 관계가 존재합니다 (ID: {})", existingFriendship.get().getId());
        }
    }

    /**
     * 매칭 통계 출력
     */
    private void printMatchingStats(Dog dog1, Dog dog2) {
        log.info("📊 === 매칭 통계 ===");

        // dog1의 통계
        long dog1SentLikes = dogLikeRepository.countBySenderDog(dog1);
        long dog1ReceivedLikes = dogLikeRepository.countByReceiverDog(dog1);
        log.info("{} 통계 - 보낸 좋아요: {}개, 받은 좋아요: {}개",
                dog1.getDname(), dog1SentLikes, dog1ReceivedLikes);

        // dog2의 통계
        long dog2SentLikes = dogLikeRepository.countBySenderDog(dog2);
        long dog2ReceivedLikes = dogLikeRepository.countByReceiverDog(dog2);
        log.info("{} 통계 - 보낸 좋아요: {}개, 받은 좋아요: {}개",
                dog2.getDname(), dog2SentLikes, dog2ReceivedLikes);

        // 전체 좋아요 개수
        long totalLikes = dogLikeRepository.count();
        log.info("전체 좋아요 개수: {}", totalLikes);

        // 상호 좋아요 확인
        boolean isMutual = dogLikeRepository.isMutualLike(dog1, dog2);
        log.info("상호 좋아요 상태: {}", isMutual ? "✅ 매칭 완료" : "❌ 단방향");

        log.info("📊 === 통계 종료 ===");
    }

    /**
     * 상호 좋아요 친구 목록 조회
     */
    @Transactional(readOnly = true)
    public List<Dog> getMutuallyLikedFriends(Dog myDog) {
        log.info("💕 {} 의 상호 좋아요 친구 목록 조회", myDog.getDname());

        List<Dog> mutualFriends = dogLikeRepository.findMutuallyLikedDogs(myDog);

        log.info("상호 좋아요 친구 수: {}마리", mutualFriends.size());
        for (Dog friend : mutualFriends) {
            log.info("- {} (ID: {})", friend.getDname(), friend.getDno());
        }

        return mutualFriends;
    }

    // === 기존 매칭 메서드들 (검색 관련) ===

    /**
     * 로그인 사용자용 강아지 검색 (자신의 강아지 제외)
     */
    public List<Dog> findDogsForLoggedInUser(String userEmail) {
        try {
            User currentUser = userRepository.findByUemail(userEmail)
                    .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

            List<Dog> allDogs = dogRepository.findAllByOrderByDnoDesc();

            // 자신의 강아지들 제외
            return allDogs.stream()
                    .filter(dog -> !dog.getOwner().getUno().equals(currentUser.getUno()))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("로그인 사용자용 강아지 검색 실패: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    /**
     * 비회원용 모든 강아지 조회
     */
    public List<Dog> findAllDogsForMatching() {
        try {
            return dogRepository.findAllByOrderByDnoDesc();
        } catch (Exception e) {
            log.error("모든 강아지 조회 실패: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    /**
     * 키워드 기반 랜덤 강아지 검색 (로그인 사용자)
     */
    public List<Dog> findRandomDogsByKeywordForUser(String keyword, String userEmail, int limit) {
        try {
            User currentUser = userRepository.findByUemail(userEmail)
                    .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

            List<Dog> keywordDogs = dogRepository.findByKeyword1Containing(keyword);

            return keywordDogs.stream()
                    .filter(dog -> !dog.getOwner().getUno().equals(currentUser.getUno()))
                    .limit(limit)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("키워드 검색 실패: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    /**
     * 키워드 기반 랜덤 강아지 검색 (비회원)
     */
    public List<Dog> findRandomDogsByKeyword(String keyword, int limit) {
        try {
            return dogRepository.findByKeyword1Containing(keyword)
                    .stream()
                    .limit(limit)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("키워드 검색 실패: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    /**
     * 랜덤 강아지 조회 (로그인 사용자)
     */
    public List<Dog> findRandomDogsForUser(String userEmail, int limit) {
        return findDogsForLoggedInUser(userEmail)
                .stream()
                .limit(limit)
                .collect(Collectors.toList());
    }

    /**
     * 랜덤 강아지 조회 (비회원)
     */
    public List<Dog> findRandomDogs(int limit) {
        return findAllDogsForMatching()
                .stream()
                .limit(limit)
                .collect(Collectors.toList());
    }

    /**
     * 복합 검색 (로그인 사용자)
     */
    public List<Dog> searchDogsForUser(String gender, String breed, String location,
                                       String keyword1, String userEmail, int limit) {
        try {
            User currentUser = userRepository.findByUemail(userEmail)
                    .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

            List<Dog> searchResults = dogRepository.findDogsWithFilters(gender, breed, location, keyword1);

            return searchResults.stream()
                    .filter(dog -> !dog.getOwner().getUno().equals(currentUser.getUno()))
                    .limit(limit)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("복합 검색 실패: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    /**
     * 복합 검색 (비회원)
     */
    public List<Dog> searchDogsForGuest(String gender, String breed, String location,
                                        String keyword1, int limit) {
        try {
            return dogRepository.findDogsWithFilters(gender, breed, location, keyword1)
                    .stream()
                    .limit(limit)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("복합 검색 실패: {}", e.getMessage());
            return Collections.emptyList();
        }
    }
}