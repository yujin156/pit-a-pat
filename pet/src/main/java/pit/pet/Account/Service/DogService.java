package pit.pet.Account.Service;


import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import pit.pet.Account.Repository.*;
import pit.pet.Account.Request.DogRegisterRequest;
import pit.pet.Account.User.*;
import pit.pet.Spec.Species;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DogService {

    private final DogRepository dogRepository;
    private final SpeciesRepository speciesRepository;
    private final DogKeyword1Repository keyword1Repository;
    private final DogKeyword2Repository keyword2Repository;
    private final DogimgRepository dogimgRepository;
    private final UserRepository userRepository;

    private final String uploadDir = "src/main/resources/static/uploads/";

    @Transactional
    public void registerDog(DogRegisterRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));

        Dog dog = new Dog();
        dog.setDname(request.getName());
        dog.setUgender(Gender.fromUserLabel(request.getGender()));
        dog.setDBday(request.getBirthday());
        dog.setDintro(request.getIntro());
        dog.setOwner(user);

        Species species = speciesRepository.findById(request.getSpeciesId())
                .orElseThrow(() -> new RuntimeException("종을 찾을 수 없습니다."));
        dog.setSpecies(species);

        // ✅ 널이면 빈 리스트 처리
        List<Long> keyword1Ids = request.getKeyword1Ids() != null ? request.getKeyword1Ids() : Collections.emptyList();
        List<Long> keyword2Ids = request.getKeyword2Ids() != null ? request.getKeyword2Ids() : Collections.emptyList();

        dog.setKeywords1(keyword1Repository.findAllById(keyword1Ids));
        dog.setKeywords2(keyword2Repository.findAllById(keyword2Ids));

        dogRepository.save(dog);

        // ✅ 이미지 업로드 처리
        MultipartFile image = request.getImageFile();
        if (image != null && !image.isEmpty()) {
            try {
                String filename = UUID.randomUUID() + "_" + image.getOriginalFilename();
                Path filepath = Paths.get(uploadDir, filename);
                Files.createDirectories(filepath.getParent());
                Files.copy(image.getInputStream(), filepath, StandardCopyOption.REPLACE_EXISTING);

                Dogimg dogimg = new Dogimg();
                dogimg.setDog(dog);
                dogimg.setDi_url("/uploads/" + filename);
                dogimgRepository.save(dogimg);

            } catch (IOException e) {
                throw new RuntimeException("이미지 저장 실패", e);
            }
        }
    }
}
