package pit.pet.Account.Response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class DogProfileResponse {
    private Long id;
    private String name;
    private String gender;
    private String size;
    private String breed;
    private String intro;
    private String imageUrl;
}
