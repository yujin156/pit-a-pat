package pit.pet.Friend;

import org.springframework.data.jpa.repository.JpaRepository;
import pit.pet.Account.User.Dog;
import pit.pet.Friend.RequestStatus;

import java.util.List;
import java.util.Optional;

public interface FriendRequestRepository extends JpaRepository<pit.pet.Friend.FriendRequest, Long> {
    // profile 없이 단순히 requester↔receiver
    Optional<pit.pet.Friend.FriendRequest> findByRequesterAndReceiver(Dog requester, Dog receiver);
    List<pit.pet.Friend.FriendRequest> findByReceiverAndStatus(Dog receiver, RequestStatus status);
    List<pit.pet.Friend.FriendRequest> findByRequesterAndStatus(Dog requester, RequestStatus status);
}