package pit.pet.Match;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pit.pet.Account.User.Dog;

import java.util.List;
import java.util.Optional;

@Repository
public interface DogLikeRepository extends JpaRepository<DogLike, Long> {

    /**
     * 특정 강아지가 특정 강아지에게 좋아요했는지 확인
     */
    Optional<DogLike> findBySenderDogAndReceiverDog(Dog senderDog, Dog receiverDog);

    /**
     * 특정 강아지가 보낸 모든 좋아요 목록
     */
    List<DogLike> findBySenderDog(Dog senderDog);

    /**
     * 특정 강아지가 받은 모든 좋아요 목록
     */
    List<DogLike> findByReceiverDog(Dog receiverDog);

    /**
     * 특정 강아지가 받은 좋아요 개수
     */
    long countByReceiverDog(Dog receiverDog);

    /**
     * 특정 강아지가 보낸 좋아요 개수
     */
    long countBySenderDog(Dog senderDog);

    /**
     * 두 강아지 간의 상호 좋아요 확인 (매칭 성사 여부)
     */
    default boolean isMutualLike(Dog dog1, Dog dog2) {
        return findBySenderDogAndReceiverDog(dog1, dog2).isPresent() &&
                findBySenderDogAndReceiverDog(dog2, dog1).isPresent();
    }
}