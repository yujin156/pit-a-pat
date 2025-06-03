package pit.pet.Account.Response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import pit.pet.Account.User.Dog;
@Getter
@Setter
@AllArgsConstructor
public class DogProfileResponse {
    private Long id;
    private String name;
    private String gender;
    private String size;
    private String breed;
    private String intro;
    private String imageUrl;

    // 엔티티 → DTO 변환 (생성자 이용)
    public static DogProfileResponse fromEntity(Dog dog) {
        return new DogProfileResponse(
                dog.getDno(),
                dog.getDname(),
                dog.getUgender() != null ? dog.getUgender().name() : "",
                dog.getSize() != null ? dog.getSize().name().toLowerCase() : null,
                dog.getSpecies() != null ? dog.getSpecies().getName() : "",
                dog.getDintro(),
                (dog.getImage() != null && dog.getImage().getDiurl() != null)
                        ? dog.getImage().getDiurl()
                        : null
        );
    }
}

