package pit.pet.Account.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pit.pet.Account.User.Dog;
import pit.pet.Account.User.User;

import java.util.List;

@Repository
public interface DogRepository extends JpaRepository<Dog, Long> {

    // 기존 메서드들...

    // ===== 매칭 기능용 메서드들 추가 =====

    /**
     * 특정 사용자의 강아지 목록 조회
     */
    List<Dog> findByOwner(User owner);

    /**
     * 최신 등록 순으로 모든 강아지 조회
     */
    List<Dog> findAllByOrderByDnoDesc();

    /**
     * 필터 조건으로 강아지 검색 (Gender enum 고려)
     */
    @Query("SELECT DISTINCT d FROM Dog d " +
            "LEFT JOIN d.keywords1 k1 " +
            "LEFT JOIN d.species s " +
            "LEFT JOIN d.owner o " +
            "LEFT JOIN o.address a " +
            "WHERE (:gender IS NULL OR :gender = '' OR " +
            "       (CAST(d.ugender AS string) = :gender) OR " +
            "       (d.ugender = 'MALE' AND :gender = '남자') OR " +
            "       (d.ugender = 'FEMALE' AND :gender = '여자')) " +
            "AND (:breed IS NULL OR :breed = '' OR s.name LIKE %:breed%) " +
            "AND (:location IS NULL OR :location = '' OR a.city LIKE %:location% OR a.county LIKE %:location%) " +
            "AND (:keyword1 IS NULL OR :keyword1 = '' OR k1.dktag LIKE %:keyword1%) " +
            "ORDER BY d.dno DESC")
    List<Dog> findDogsWithFilters(
            @Param("gender") String gender,
            @Param("breed") String breed,
            @Param("location") String location,
            @Param("keyword1") String keyword1);

    /**
     * 키워드1로 강아지 검색
     */
    @Query("SELECT DISTINCT d FROM Dog d " +
            "LEFT JOIN d.keywords1 k1 " +
            "WHERE k1.dktag LIKE %:keyword% " +
            "ORDER BY d.dno DESC")
    List<Dog> findByKeyword1Containing(@Param("keyword") String keyword);

    /**
     * 성별로 강아지 검색
     */
    @Query("SELECT d FROM Dog d WHERE d.ugender = :gender ORDER BY d.dno DESC")
    List<Dog> findByGender(@Param("gender") String gender);

    /**
     * 견종으로 강아지 검색
     */
    @Query("SELECT d FROM Dog d " +
            "LEFT JOIN d.species s " +
            "WHERE s.name LIKE %:breed% " +
            "ORDER BY d.dno DESC")
    List<Dog> findByBreed(@Param("breed") String breed);

    /**
     * 지역으로 강아지 검색
     */
    @Query("SELECT d FROM Dog d " +
            "LEFT JOIN d.owner o " +
            "WHERE o.address.city LIKE %:location% OR o.address.county LIKE %:location% " +
            "ORDER BY d.dno DESC")
    List<Dog> findByLocation(@Param("location") String location);
}