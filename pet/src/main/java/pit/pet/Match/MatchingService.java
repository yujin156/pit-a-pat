package pit.pet.Match;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pit.pet.Account.Repository.DogRepository;
import pit.pet.Account.Repository.UserRepository;
import pit.pet.Account.User.Dog;
import pit.pet.Account.User.Gender;
import pit.pet.Account.User.User;
import pit.pet.Friend.FriendRequest;
import pit.pet.Friend.FriendRequestRepository;
import pit.pet.Friend.RequestStatus;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MatchingService {

    private final DogRepository dogRepository;
    private final UserRepository userRepository;
    private final DogLikeRepository dogLikeRepository;
    private final FriendRequestRepository friendRequestRepository;

    @Transactional
    public boolean toggleLike(User currentUser, Long targetDogId, Long myDogId) {
        Dog myDog = dogRepository.findById(myDogId)
                .orElseThrow(() -> new RuntimeException("내 강아지를 찾을 수 없습니다."));
        Dog targetDog = dogRepository.findById(targetDogId)
                .orElseThrow(() -> new RuntimeException("대상 강아지를 찾을 수 없습니다."));

        if (!myDog.getOwner().getUno().equals(currentUser.getUno())) {
            throw new RuntimeException("본인의 강아지가 아닙니다.");
        }

        if (myDog.equals(targetDog)) {
            throw new RuntimeException("자기 자신에게는 좋아요할 수 없습니다.");
        }

        Optional<DogLike> existing = dogLikeRepository.findBySenderDogAndReceiverDog(myDog, targetDog);
        if (existing.isPresent()) {
            return false;
        }

        DogLike like = new DogLike();
        like.setSenderDog(myDog);
        like.setReceiverDog(targetDog);
        dogLikeRepository.save(like);

        Optional<DogLike> reverse = dogLikeRepository.findBySenderDogAndReceiverDog(targetDog, myDog);
        if (reverse.isPresent()) {
            createFriendshipIfNotExists(myDog, targetDog);
            return true;
        }

        return false;
    }

    private void createFriendshipIfNotExists(Dog d1, Dog d2) {
        Optional<FriendRequest> existing = friendRequestRepository.findByRequesterAndReceiver(d1, d2)
                .or(() -> friendRequestRepository.findByRequesterAndReceiver(d2, d1));

        if (existing.isEmpty()) {
            FriendRequest friend = FriendRequest.builder()
                    .requester(d1)
                    .receiver(d2)
                    .status(RequestStatus.ACCEPTED)
                    .requestedAt(LocalDateTime.now())
                    .build();

            friendRequestRepository.save(friend);
        }
    }

    public List<Dog> getFilteredCandidatesForSelectedDog(Dog myDog) {
        return dogRepository.findAll().stream()
                .filter(d -> !d.getOwner().getUno().equals(myDog.getOwner().getUno()))
                .filter(d -> friendRequestRepository.findByRequesterAndReceiver(myDog, d).isEmpty())
                .filter(d -> dogLikeRepository.findBySenderDogAndReceiverDog(myDog, d).isEmpty())
                .collect(Collectors.toList());
    }

    public List<Dog> getCandidatesWithOnlyFamilyExcluded(User currentUser) {
        return dogRepository.findAll().stream()
                .filter(d -> !d.getOwner().getUno().equals(currentUser.getUno()))
                .collect(Collectors.toList());
    }

    public List<Dog> findRandomDogsByMultipleKeywords(List<String> keywords, int limit) {
        try {
            return dogRepository.findRandomByAnyKeywords(keywords)
                    .stream()
                    .limit(limit)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("다중 키워드 검색 실패 (비회원): {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    public List<Dog> findRandomDogsByMultipleKeywordsForUser(List<String> keywords, String userEmail, int limit) {
        try {
            User currentUser = userRepository.findByUemail(userEmail)
                    .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

            return dogRepository.findRandomByAnyKeywordsExcludingUser(keywords, currentUser.getUemail())
                    .stream()
                    .limit(limit)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("다중 키워드 검색 실패 (로그인): {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    public List<Dog> findDogsForLoggedInUser(String userEmail) {
        try {
            User currentUser = userRepository.findByUemail(userEmail)
                    .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

            List<Dog> allDogs = dogRepository.findAllByOrderByDnoDesc();

            return allDogs.stream()
                    .filter(dog -> !dog.getOwner().getUno().equals(currentUser.getUno()))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("로그인 사용자용 강아지 검색 실패: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    public List<Dog> findAllDogsForMatching() {
        try {
            return dogRepository.findAllByOrderByDnoDesc();
        } catch (Exception e) {
            log.error("모든 강아지 조회 실패: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

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

    public List<Dog> findRandomDogsForUser(String userEmail, int limit) {
        return findDogsForLoggedInUser(userEmail)
                .stream()
                .limit(limit)
                .collect(Collectors.toList());
    }

    public List<Dog> findRandomDogs(int limit) {
        return findAllDogsForMatching()
                .stream()
                .limit(limit)
                .collect(Collectors.toList());
    }

    public List<Dog> searchDogsForUser(String gender, String speciesId,
                                       String city, String county, String town,
                                       String keyword1, String userEmail, int limit) {
        try {
            User currentUser = userRepository.findByUemail(userEmail)
                    .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

            List<Dog> allDogs = dogRepository.findAll();
            Gender genderEnum = Gender.fromSearchString(gender);

            return allDogs.stream()
                    .filter(d -> !d.getOwner().getUno().equals(currentUser.getUno()))
                    .filter(d -> genderEnum == null || (d.getUgender() != null && d.getUgender().equals(genderEnum)))
                    .filter(d -> speciesId == null || d.getSpecies().getId().toString().equals(speciesId))
                    .filter(d -> city == null || city.equals(d.getOwner().getAddress().getCity()))
                    .filter(d -> county == null || county.equals(d.getOwner().getAddress().getCounty()))
                    .filter(d -> town == null || town.equals(d.getOwner().getAddress().getTown()))
                    .limit(limit)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("복합 검색 실패 (사용자): {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    public List<Dog> searchDogsForGuest(String gender, String speciesId,
                                        String city, String county, String town,
                                        String keyword1, int limit) {
        try {
            List<Dog> allDogs = dogRepository.findAll();
            Gender genderEnum = Gender.fromSearchString(gender);

            return allDogs.stream()
                    .filter(d -> genderEnum == null || (d.getUgender() != null && d.getUgender().equals(genderEnum)))
                    .filter(d -> speciesId == null || d.getSpecies().getId().toString().equals(speciesId))
                    .filter(d -> city == null || city.equals(d.getOwner().getAddress().getCity()))
                    .filter(d -> county == null || county.equals(d.getOwner().getAddress().getCounty()))
                    .filter(d -> town == null || town.equals(d.getOwner().getAddress().getTown()))
                    .limit(limit)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("복합 검색 실패 (비회원): {}", e.getMessage());
            return Collections.emptyList();
        }

    }
    public List<Dog> getRandomCandidates(int limit) {
        return dogRepository.findRandomDogs(limit);
    }
}