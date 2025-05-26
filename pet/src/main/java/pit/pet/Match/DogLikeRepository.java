package pit.pet.Match;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    /**
     * 특정 강아지와 상호 좋아요 상태인 모든 강아지 조회
     */
    @Query("SELECT DISTINCT CASE " +
            "WHEN dl1.senderDog = :dog THEN dl1.receiverDog " +
            "ELSE dl1.senderDog END " +
            "FROM DogLike dl1 " +
            "WHERE (dl1.senderDog = :dog OR dl1.receiverDog = :dog) " +
            "AND EXISTS (SELECT dl2 FROM DogLike dl2 " +
            "WHERE ((dl2.senderDog = dl1.receiverDog AND dl2.receiverDog = dl1.senderDog) " +
            "OR (dl2.senderDog = dl1.senderDog AND dl2.receiverDog = dl1.receiverDog)) " +
            "AND dl2.likeId != dl1.likeId)")
    List<Dog> findMutuallyLikedDogs(@Param("dog") Dog dog);

    /**
     * 특정 강아지의 모든 좋아요 관계 삭제 (친구 삭제시 사용)
     */
    void deleteBySenderDogOrReceiverDog(Dog senderDog, Dog receiverDog);

    /**
     * 두 강아지 간의 모든 좋아요 관계 삭제
     */
    @Query("DELETE FROM DogLike dl WHERE " +
            "(dl.senderDog = :dog1 AND dl.receiverDog = :dog2) OR " +
            "(dl.senderDog = :dog2 AND dl.receiverDog = :dog1)")
    void deleteAllBetweenDogs(@Param("dog1") Dog dog1, @Param("dog2") Dog dog2);
}