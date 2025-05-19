package pit.pet.Friend;

import org.springframework.data.jpa.repository.JpaRepository;
import pit.pet.Account.User.Dog;
import pit.pet.Account.User.DogProfile;

import java.util.List;
import java.util.Optional;

public interface FriendRequestRepository extends JpaRepository<FriendRequest, Long> {
    // profile 없이 단순히 requester↔receiver
    Optional<FriendRequest> findByRequesterAndReceiver(Dog requester, Dog receiver);
    List<FriendRequest> findByReceiverAndStatus(Dog receiver, RequestStatus status);
    List<FriendRequest> findByRequesterAndStatus(Dog requester, RequestStatus status);
}
