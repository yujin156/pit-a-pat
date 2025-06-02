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

    // ===== 기본 조회 메서드들 =====

    /**
     * 특정 사용자의 강아지들 조회
     */
    List<Dog> findByOwner(User owner);

    /**
     * 강아지 ID로 조회
     */
    Optional<Dog> findById(Long dno);

    /**
     * 모든 강아지 최신순 조회
     */
    List<Dog> findAllByOrderByDnoDesc();

    /**
     * 🔥 특정 사용자의 가장 최근 강아지 조회 (회원가입 시 키워드 추가용)
     */
    Optional<Dog> findTopByOwner_UnoOrderByDnoDesc(Long userId);

    /**
     * 또는 더 명확한 방법 (위 메서드가 작동하지 않을 경우 사용)
     */
    @Query("SELECT d FROM Dog d WHERE d.owner.uno = :userId ORDER BY d.dno DESC")
    Optional<Dog> findLatestDogByUserId(@Param("userId") Long userId);

    // ===== 매칭용 검색 메서드들 (기존 개선) =====

    /**
     * 🎯 복합 조건으로 강아지 검색 (매칭 페이지 핵심 메서드)
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
     * 🎯 키워드1로 강아지 검색 (매칭 페이지용)
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

    // ===== 🔥 매칭 시스템 전용 메서드들 (새로 추가) =====

    /**
     * 특정 사용자를 제외한 강아지들 조회 (로그인 사용자 매칭용)
     */
    @Query("SELECT d FROM Dog d WHERE d.owner.uno != :userId ORDER BY d.dno DESC")
    List<Dog> findDogsExcludingUser(@Param("userId") Long userId);

    /**
     * 특정 사용자를 제외하고 키워드로 검색 (로그인 사용자 매칭용)
     */
    @Query("SELECT DISTINCT d FROM Dog d " +
            "LEFT JOIN d.keywords1 k1 " +
            "WHERE LOWER(k1.dktag) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "AND d.owner.uno != :userId " +
            "ORDER BY d.dno DESC")
    List<Dog> findByKeyword1ContainingExcludingUser(@Param("keyword") String keyword,
                                                    @Param("userId") Long userId);

    /**
     * 특정 사용자를 제외하고 복합 조건으로 검색 (로그인 사용자 매칭용)
     */
    @Query("SELECT DISTINCT d FROM Dog d " +
            "LEFT JOIN d.keywords1 k1 " +
            "LEFT JOIN d.species s " +
            "LEFT JOIN d.owner o " +
            "LEFT JOIN o.address a " +
            "WHERE d.owner.uno != :userId " +
            "AND (:gender IS NULL OR :gender = '' OR " +
            "     (LOWER(:gender) LIKE '%수컷%' AND d.ugender = 'MALE') OR " +
            "     (LOWER(:gender) LIKE '%암컷%' AND d.ugender = 'FEMALE') OR " +
            "     (LOWER(:gender) LIKE '%남%' AND d.ugender = 'MALE') OR " +
            "     (LOWER(:gender) LIKE '%여%' AND d.ugender = 'FEMALE')) " +
            "AND (:breed IS NULL OR :breed = '' OR LOWER(s.name) LIKE LOWER(CONCAT('%', :breed, '%'))) " +
            "AND (:location IS NULL OR :location = '' OR " +
            "     LOWER(a.city) LIKE LOWER(CONCAT('%', :location, '%')) OR " +
            "     LOWER(a.county) LIKE LOWER(CONCAT('%', :location, '%'))) " +
            "AND (:keyword1 IS NULL OR :keyword1 = '' OR LOWER(k1.dktag) LIKE LOWER(CONCAT('%', :keyword1, '%'))) " +
            "ORDER BY d.dno DESC")
    List<Dog> findDogsWithFiltersExcludingUser(
            @Param("gender") String gender,
            @Param("breed") String breed,
            @Param("location") String location,
            @Param("keyword1") String keyword1,
            @Param("userId") Long userId);

    // ===== 랜덤 조회 메서드들 (매칭 알고리즘용) =====

    /**
     * 랜덤으로 강아지 조회 (제한된 수) - MySQL용
     */
    @Query(value = "SELECT * FROM dog ORDER BY RAND() LIMIT :limit", nativeQuery = true)
    List<Dog> findRandomDogs(@Param("limit") int limit);

    /**
     * 특정 사용자를 제외하고 랜덤으로 강아지 조회 - MySQL용
     */
    @Query(value = "SELECT d.* FROM dog d " +
            "JOIN user u ON d.uno = u.uno " +
            "WHERE u.uno != :userId " +
            "ORDER BY RAND() LIMIT :limit", nativeQuery = true)
    List<Dog> findRandomDogsExcludingUser(@Param("userId") Long userId, @Param("limit") int limit);

    // ===== 통계 및 분석 메서드들 =====

    /**
     * 특정 사용자의 강아지 수 조회
     */
    @Query("SELECT COUNT(d) FROM Dog d WHERE d.owner.uno = :userId")
    long countByOwner(@Param("userId") Long userId);

    /**
     * 특정 키워드를 가진 강아지 수 조회
     */
    @Query("SELECT COUNT(DISTINCT d) FROM Dog d LEFT JOIN d.keywords1 k WHERE k.dktag = :keyword")
    long countByKeyword(@Param("keyword") String keyword);

    /**
     * 성별별 강아지 수 조회
     */
    @Query("SELECT COUNT(d) FROM Dog d WHERE d.ugender = :gender")
    long countByGender(@Param("gender") String gender);

    /**
     * 견종별 강아지 수 조회
     */
    @Query("SELECT COUNT(d) FROM Dog d WHERE d.species.name = :breed")
    long countByBreed(@Param("breed") String breed);

    // ===== 특수 매칭 알고리즘용 메서드들 =====

    /**
     * 특정 강아지와 같은 지역의 강아지들 조회
     */
    @Query("SELECT d FROM Dog d " +
            "JOIN d.owner.address a1 " +
            "WHERE EXISTS (" +
            "  SELECT 1 FROM Dog target " +
            "  JOIN target.owner.address a2 " +
            "  WHERE target.dno = :dogId " +
            "  AND a1.city = a2.city " +
            "  AND a1.county = a2.county" +
            ") " +
            "AND d.dno != :dogId " +
            "ORDER BY d.dno DESC")
    List<Dog> findDogsInSameLocation(@Param("dogId") Long dogId);

    /**
     * 특정 강아지와 비슷한 크기의 강아지들 조회
     */
    @Query("SELECT d FROM Dog d " +
            "WHERE d.size = (SELECT target.size FROM Dog target WHERE target.dno = :dogId) " +
            "AND d.dno != :dogId " +
            "ORDER BY d.dno DESC")
    List<Dog> findDogsWithSimilarSize(@Param("dogId") Long dogId);

    /**
     * 특정 강아지와 공통 키워드를 가진 강아지들 조회
     */
    @Query("SELECT DISTINCT d FROM Dog d " +
            "LEFT JOIN d.keywords1 k1 " +
            "WHERE k1.dktag IN (" +
            "  SELECT k2.dktag FROM Dog target " +
            "  LEFT JOIN target.keywords1 k2 " +
            "  WHERE target.dno = :dogId" +
            ") " +
            "AND d.dno != :dogId " +
            "ORDER BY d.dno DESC")
    List<Dog> findDogsWithCommonKeywords(@Param("dogId") Long dogId);

    // ===== 유틸리티 메서드들 =====

    /**
     * 특정 사용자가 강아지를 가지고 있는지 확인
     */
    boolean existsByOwner(User owner);

    /**
     * 특정 이름의 강아지가 특정 사용자에게 있는지 확인
     */
    boolean existsByDnameAndOwner(String dname, User owner);

    /**
     * 최근 등록된 강아지들 조회 (페이징 없이 제한)
     */
    @Query("SELECT d FROM Dog d ORDER BY d.dno DESC")
    List<Dog> findRecentDogs();

    /**
     * 인기 있는 견종 Top N 조회 (통계용)
     */
    @Query("SELECT s.name, COUNT(d) as dogCount FROM Dog d " +
            "JOIN d.species s " +
            "GROUP BY s.name " +
            "ORDER BY dogCount DESC")
    List<Object[]> findPopularBreeds();

    // ===== 🔥 매칭 시스템 전용 메서드들 (새로 추가) =====
    /**
     * 다중 키워드 검색 (비회원용)
     */
    @Query("SELECT DISTINCT d FROM Dog d JOIN d.keywords1 k WHERE k.dktag IN :keywords ORDER BY FUNCTION('RAND')")
    List<Dog> findRandomByAnyKeywords(@Param("keywords") List<String> keywords);

    /**
     * 다중 키워드 검색 (로그인 사용자용 - 본인 제외)
     */
    @Query("SELECT DISTINCT d FROM Dog d JOIN d.keywords1 k WHERE k.dktag IN :keywords AND d.owner.uemail <> :email ORDER BY FUNCTION('RAND')")
    List<Dog> findRandomByAnyKeywordsExcludingUser(@Param("keywords") List<String> keywords, @Param("email") String email);

}