package pit.pet.Account.Request;

import lombok.Getter;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.multipart.MultipartFile;
import pit.pet.Account.User.Gender;
import pit.pet.Account.User.NeuterStatus;

import java.util.Date;
import java.util.List;

@Getter
@Setter
public class DogRegisterRequest {
    private String name;
    private String gender;
    private String neutering;

    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private Date birthday;

    private String intro;

    private Long speciesId;
    private String size;

    // 키워드1만 남김
    private List<Long> keyword1Ids;

    private NeuterStatus neuterStatus;

    private MultipartFile imageFile; // ✅ 정확히 선언
}
