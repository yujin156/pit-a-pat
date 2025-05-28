package pit.pet.Account.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pit.pet.Account.User.Dog;
import pit.pet.Account.User.User;

import java.util.List;
import java.util.Optional;

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
     * 강아지 등록때 키워드 추가 코드
     */
    Optional<Dog> findTopByOwner_UnoOrderByDnoDesc(Long userId);

    /**
     * 필터 조건으로 강아지 검색 (성별, 견종, 지역, 키워드 검색 개선)
     */
    @Query("SELECT DISTINCT d FROM Dog d " +
            "LEFT JOIN d.keywords1 k1 " +
            "LEFT JOIN d.species s " +
            "LEFT JOIN d.owner o " +
            "LEFT JOIN o.address a " +
            "WHERE (:gender IS NULL OR :gender = '' OR " +
            "       (LOWER(:gender) LIKE '%수컷%' AND d.ugender = 'MALE') OR " +
            "       (LOWER(:gender) LIKE '%암컷%' AND d.ugender = 'FEMALE') OR " +
            "       (LOWER(:gender) LIKE '%남%' AND d.ugender = 'MALE') OR " +
            "       (LOWER(:gender) LIKE '%여%' AND d.ugender = 'FEMALE')) " +
            "AND (:breed IS NULL OR :breed = '' OR LOWER(s.name) LIKE LOWER(CONCAT('%', :breed, '%'))) " +
            "AND (:location IS NULL OR :location = '' OR " +
            "     LOWER(a.city) LIKE LOWER(CONCAT('%', :location, '%')) OR " +
            "     LOWER(a.county) LIKE LOWER(CONCAT('%', :location, '%'))) " +
            "AND (:keyword1 IS NULL OR :keyword1 = '' OR LOWER(k1.dktag) LIKE LOWER(CONCAT('%', :keyword1, '%'))) " +
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
            "WHERE LOWER(k1.dktag) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "ORDER BY d.dno DESC")
    List<Dog> findByKeyword1Containing(@Param("keyword") String keyword);

    /**
     * 성별로 강아지 검색 (개선된 버전)
     */
    @Query("SELECT d FROM Dog d WHERE " +
            "(:gender = '수컷' AND d.ugender = 'MALE') OR " +
            "(:gender = '암컷' AND d.ugender = 'FEMALE') OR " +
            "(:gender = '남성' AND d.ugender = 'MALE') OR " +
            "(:gender = '여성' AND d.ugender = 'FEMALE') " +
            "ORDER BY d.dno DESC")
    List<Dog> findByGender(@Param("gender") String gender);

    /**
     * 견종으로 강아지 검색 (개선된 버전)
     */
    @Query("SELECT d FROM Dog d " +
            "LEFT JOIN d.species s " +
            "WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :breed, '%')) " +
            "ORDER BY d.dno DESC")
    List<Dog> findByBreed(@Param("breed") String breed);

    /**
     * 지역으로 강아지 검색
     */
    @Query("SELECT d FROM Dog d " +
            "LEFT JOIN d.owner o " +
            "LEFT JOIN o.address a " +
            "WHERE LOWER(a.city) LIKE LOWER(CONCAT('%', :location, '%')) OR " +
            "      LOWER(a.county) LIKE LOWER(CONCAT('%', :location, '%')) " +
            "ORDER BY d.dno DESC")
    List<Dog> findByLocation(@Param("location") String location);
}