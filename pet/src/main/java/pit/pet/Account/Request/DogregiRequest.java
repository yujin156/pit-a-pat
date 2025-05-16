package pit.pet.Account.Request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DogregiRequest {
    @NotBlank(message = "이름을 입력해주십시오.")
    private String dname;

    @NotBlank(message = "성별을 선택해주십시오.")
    private String dGender;

    @NotBlank(message = "설명을 입력해주십시오.")
    private String dIntro;

    @NotBlank(message = "생일을 설정해주십시오.")
    private Date dBday;
}
