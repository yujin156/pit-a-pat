package pit.pet.Account.Service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import pit.pet.Account.Repository.*;
import pit.pet.Account.Request.DogRegisterRequest;
import pit.pet.Account.Response.DogProfileResponse;
import pit.pet.Account.User.*;
import pit.pet.Spec.Species;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.Principal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DogService {

    private final DogRepository dogRepository;
    private final SpeciesRepository speciesRepository;
    private final DogKeyword1Repository keyword1Repository;
    private final DogimgRepository dogimgRepository;
    private final UserRepository userRepository;
    // private final DogLikeRepository dogLikeRepository; // 좋아요 기능용 (필요시 추가)

    private String uploadDir = "pet/src/main/resources/static/uploads/dog/";


    // 🔥 1️⃣ 회원가입 중 (userId 없이)
    @Transactional
    public Long registerDog(DogRegisterRequest request, Long userId) {

        // userId 없이 dog만 저장 (주인도 null로 두거나 기본값 처리)
        Dog dog = new Dog();
        dog.setDname(request.getName());
        dog.setUgender(Gender.valueOf(request.getGender()));
        dog.setSize(DogSize.valueOf(request.getSize()));
        dog.setDBday(request.getBirthday());
        dog.setDintro(request.getIntro());
        dog.setNeuterStatus(request.getNeuterStatus());
        // owner 연결
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));
        dog.setOwner(owner);

        // 종
        Species species = speciesRepository.findById(request.getSpeciesId())
                .orElseThrow(() -> new RuntimeException("종을 찾을 수 없습니다."));
        dog.setSpecies(species);

        dogRepository.save(dog);

        // 이미지
        MultipartFile image = request.getImageFile();
        if (image != null && !image.isEmpty()) {
            try {
                String filename = UUID.randomUUID() + "_" + image.getOriginalFilename();
                Path filepath = Paths.get(uploadDir, filename);
                Files.createDirectories(filepath.getParent());
                Files.copy(image.getInputStream(), filepath, StandardCopyOption.REPLACE_EXISTING);

                Dogimg dogimg = new Dogimg();
                dogimg.setDog(dog);
                dogimg.setDititle(image.getOriginalFilename());
                dogimg.setDiurl("/uploads/dog/" + filename);
                dogimgRepository.save(dogimg);

            } catch (IOException e) {
                throw new RuntimeException("이미지 저장 실패", e);
            }
        }

        return dog.getDno();
    }

    @Transactional
    public void updateDogKeywordsDirectly(Long dogId, List<Long> keywordIds) {
        System.out.println("🐾 updateDogKeywordsDirectly: dogId=" + dogId + ", keywordIds=" + keywordIds);
        Dog dog = dogRepository.findById(dogId)
                .orElseThrow(() -> new RuntimeException("강아지를 찾을 수 없습니다."));

        dog.setKeywords1(keyword1Repository.findAllById(keywordIds));
        dogRepository.save(dog);
    }
    @Transactional
    public Long findLatestDogIdByUser(Long userId) {
        Dog dog = dogRepository.findTopByOwner_UnoOrderByDnoDesc(userId)
                .orElseThrow(() -> new RuntimeException("최근 등록된 강아지가 없습니다."));
        return dog.getDno();
    }

    // ===== 매칭 기능용 메서드들 추가 =====

    // 강아지 프로필 이미지 url 조회
    public String getProfileImageUrl(Long dno) {
        Optional<Dogimg> dogimgOpt = dogimgRepository.findFirstByDog_Dno(dno);

        if (dogimgOpt.isPresent()) {
            String diurl = dogimgOpt.get().getDiurl();
            // 🔥 파일 존재 여부 확인
            Path path = Paths.get("src/main/resources/static" + diurl);
            if (Files.exists(path)) {
                return diurl;
            } else {
                // 파일이 없으면 기본 이미지로
                return "/images/default-profile.png";
            }
        } else {
            return "/images/default-profile.png";
        }
    }
    /**
     * 모든 강아지 목록 조회 (최신순)
     */
    public List<Dog> findAllDogs() {
        return dogRepository.findAllByOrderByDnoDesc();
    }

    /**
     * 특정 사용자의 강아지 목록 조회
     */
    public List<Dog> findByOwner(User owner) {
        return dogRepository.findByOwner(owner);
    }

    // ===== 호환성을 위한 메서드 (MatchingController에서 사용) =====
    public List<Dog> findByMember(User member) {
        return findByOwner(member);
    }

    /**
     * 필터 조건으로 강아지 검색
     */
    public List<Dog> searchDogs(String gender, String breed, String location, String keyword1) {
        // 모든 필터가 비어있으면 전체 목록 반환
        if (isEmptyString(gender) && isEmptyString(breed) &&
                isEmptyString(location) && isEmptyString(keyword1)) {
            return findAllDogs();
        }

        return dogRepository.findDogsWithFilters(gender, breed, location, keyword1);
    }

    /**
     * 키워드로 강아지 검색
     */
    public List<Dog> searchByKeyword1(String keyword) {
        if (isEmptyString(keyword)) {
            return findAllDogs();
        }
        return dogRepository.findByKeyword1Containing(keyword);
    }

    /**
     * 강아지 ID로 조회
     */
    public Optional<Dog> findById(Long dogId) {
        return dogRepository.findById(dogId);
    }

    /**
     * 좋아요 토글 (기본 구현 - 실제 DogLike 엔티티가 있으면 수정 필요)
     */
    @Transactional
    public boolean toggleLike(User member, Long dogId) {
        // TODO: 실제 좋아요 기능 구현
        // DogLike 엔티티와 Repository가 필요합니다

        Optional<Dog> dogOpt = findById(dogId);
        if (!dogOpt.isPresent()) {
            throw new RuntimeException("강아지를 찾을 수 없습니다.");
        }

        // 임시로 true 반환 (실제로는 좋아요 상태에 따라 반환)
        return true;

        /* 실제 구현 예시:
        Dog dog = dogOpt.get();
        Optional<DogLike> existingLike = dogLikeRepository.findByMemberAndDog(member, dog);

        if (existingLike.isPresent()) {
            // 좋아요 취소
            dogLikeRepository.delete(existingLike.get());
            return false;
        } else {
            // 좋아요 추가
            DogLike dogLike = new DogLike();
            dogLike.setMember(member);
            dogLike.setDog(dog);
            dogLikeRepository.save(dogLike);
            return true;
        }
        */
    }

    /**
     * 사용자가 특정 강아지를 좋아요했는지 확인
     */
    public boolean isLikedByMember(User member, Dog dog) {
        // TODO: 실제 좋아요 상태 확인 로직
        if (member == null) return false;

        // 임시로 false 반환
        return false;

        /* 실제 구현 예시:
        return dogLikeRepository.findByMemberAndDog(member, dog).isPresent();
        */
    }

    @Transactional
    public List<DogProfileResponse> getDogsByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));

        return dogRepository.findByOwner(user).stream()
                .map(dog -> new DogProfileResponse(
                        dog.getDno(),
                        dog.getDname(),
                        dog.getUgender().name(),
                        dog.getSize().name(),
                        dog.getSpecies() != null ? dog.getSpecies().getName() : "기타",
                        dog.getDintro(),
                        dog.getImage() != null ? dog.getImage().getDiurl() : null
                ))
                .collect(Collectors.toList());
    }
    public void deleteDogById(Long dno, Principal principal) {
        User user = userRepository.findByUemail(principal.getName()).orElseThrow();
        Dog dog = dogRepository.findById(dno)
                .filter(d -> d.getOwner().getUno().equals(user.getUno()))
                .orElseThrow(() -> new RuntimeException("강아지를 찾을 수 없거나 권한 없음"));
        dogRepository.delete(dog);
    }
    // ===== 유틸리티 메서드 =====

    private boolean isEmptyString(String str) {
        return str == null || str.trim().isEmpty();
    }
}