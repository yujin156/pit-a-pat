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

    Optional<DogLike> findBySenderDogAndReceiverDog(Dog senderDog, Dog receiverDog);

    List<DogLike> findBySenderDog(Dog senderDog);

    List<DogLike> findByReceiverDog(Dog receiverDog);

    long countByReceiverDog(Dog receiverDog);

    long countBySenderDog(Dog senderDog);

    default boolean isMutualLike(Dog dog1, Dog dog2) {
        return findBySenderDogAndReceiverDog(dog1, dog2).isPresent() &&
                findBySenderDogAndReceiverDog(dog2, dog1).isPresent();
    }

    @Query("SELECT l.receiverDog FROM DogLike l " +
            "WHERE l.senderDog = :dog AND l.receiverDog IN (" +
            "SELECT r.senderDog FROM DogLike r WHERE r.receiverDog = :dog)")
    List<Dog> findMutuallyLikedDogs(@Param("dog") Dog dog);

    void deleteBySenderDogOrReceiverDog(Dog senderDog, Dog receiverDog);

    @Query("DELETE FROM DogLike dl WHERE " +
            "(dl.senderDog = :dog1 AND dl.receiverDog = :dog2) OR " +
            "(dl.senderDog = :dog2 AND dl.receiverDog = :dog1)")
    void deleteAllBetweenDogs(@Param("dog1") Dog dog1, @Param("dog2") Dog dog2);
}