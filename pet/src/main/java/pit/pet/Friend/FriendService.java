package pit.pet.Friend;


import jakarta.persistence.EntityNotFoundException;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pit.pet.Account.Repository.DogProfileRepository;
import pit.pet.Account.Repository.DogRepository;
import pit.pet.Account.User.Dog;
import pit.pet.Account.User.DogProfile;
import pit.pet.Account.User.User;
import pit.pet.Match.DogLikeRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class FriendService {
    private final FriendRequestRepository friendRepo;
    private final DogRepository        dogRepo;
    private final DogLikeRepository dogLikeRepo;

    @Transactional
    public void sendRequest(Long reqDno, Long resDno, String principalEmail) {
        if (reqDno.equals(resDno)) {
            throw new IllegalArgumentException("자기 자신의 강아지에게는 요청할 수 없습니다.");
        }

        Dog requester = dogRepo.findById(reqDno)
                .orElseThrow(() -> new EntityNotFoundException("요청자 강아지를 찾을 수 없습니다."));
        Dog receiver = dogRepo.findById(resDno)
                .orElseThrow(() -> new EntityNotFoundException("수신자 강아지를 찾을 수 없습니다."));

        // 권한 체크
        if (!requester.getOwner().getUemail().equals(principalEmail)) {
            throw new AccessDeniedException("본인의 강아지로만 요청할 수 있습니다.");
        }

        // 중복 요청 방지
        friendRepo.findByRequesterAndReceiver(requester, receiver)
                .ifPresent(fr -> { throw new IllegalStateException("이미 요청이 존재합니다."); });

        FriendRequest fr = FriendRequest.builder()
                .requester(requester)
                .receiver(receiver)
                .status(RequestStatus.PENDING)
                .requestedAt(LocalDateTime.now())
                .build();
        friendRepo.save(fr);
    }

    @Transactional
    public void acceptRequest(Long requestId, String principalEmail) {
        FriendRequest fr = friendRepo.findById(requestId)
                .orElseThrow(() -> new EntityNotFoundException("요청을 찾을 수 없습니다."));
        if (!fr.getReceiver().getOwner().getUemail().equals(principalEmail)) {
            throw new AccessDeniedException("수신자 강아지의 주인만 수락할 수 있습니다.");
        }
        if (fr.getStatus() != RequestStatus.PENDING) {
            throw new IllegalStateException("처리할 수 없는 상태입니다.");
        }
        fr.setStatus(RequestStatus.ACCEPTED);
    }

    @Transactional
    public void rejectRequest(Long requestId, String principalEmail) {
        FriendRequest fr = friendRepo.findById(requestId)
                .orElseThrow(() -> new EntityNotFoundException("요청을 찾을 수 없습니다."));
        if (!fr.getReceiver().getOwner().getUemail().equals(principalEmail)) {
            throw new AccessDeniedException("수신자 강아지의 주인만 거절할 수 있습니다.");
        }
        fr.setStatus(RequestStatus.REJECTED);
    }

    @Transactional(readOnly = true)
    public List<Dog> getFriends(Long myDogDno) {
        Dog me = dogRepo.findById(myDogDno)
                .orElseThrow(() -> new EntityNotFoundException("강아지를 찾을 수 없습니다."));
        List<Dog> friends = new ArrayList<>();

        friendRepo.findByRequesterAndStatus(me, RequestStatus.ACCEPTED)
                .forEach(fr -> friends.add(fr.getReceiver()));
        friendRepo.findByReceiverAndStatus(me, RequestStatus.ACCEPTED)
                .forEach(fr -> friends.add(fr.getRequester()));

        return friends;
    }

    @Transactional(readOnly = true)
    public List<Dog> getAllFriendsOfUser(User user) {
        // 1) 내 강아지 전부
        List<Dog> myDogs = dogRepo.findByOwner(user);

        // 2) 각각 친구 리스트를 Set으로 중복 제거하며 합치기
        Set<Dog> all = new HashSet<>();
        for (Dog d : myDogs) {
            all.addAll(getFriends(d.getDno()));
        }
        return new ArrayList<>(all);
    }
    @Transactional(readOnly = true)
    public List<Dog> getMatchedFriends(Long dogId) {
        Dog dog = dogRepo.findById(dogId)
                .orElseThrow(() -> new EntityNotFoundException("강아지를 찾을 수 없습니다."));
        return dogLikeRepo.findMutuallyLikedDogs(dog);
    }
    @Transactional(readOnly = true)
    public List<FriendRequest> getPendingRequests(Long myDogDno) {
        Dog me = dogRepo.findById(myDogDno)
                .orElseThrow(() -> new EntityNotFoundException("강아지를 찾을 수 없습니다."));
        return friendRepo.findByReceiverAndStatus(me, RequestStatus.PENDING);
    }
}