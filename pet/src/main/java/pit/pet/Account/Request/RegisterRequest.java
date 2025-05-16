package pit.pet.Account.Request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    @NotBlank(message = "이름을 입력해주십시오.")
    @Size(min = 3, max = 20, message = "이름은 3자에서 20자 사이로 입력해주십시오.")
    private String uname;

    @NotBlank(message = "성별을 선택해주십시오.")
    private String uGender;

    @NotBlank(message = "이메일을 입력해주십시오.")
    @Email(message = "이메일 형식(@)을 지켜주십시오.")
    private String uemail;

    @NotBlank(message = "비밀번호를 입력해주십시오")
    @Size(min = 7, max = 20, message = "7자에서 20자 사이로 입력해주십시오")
    private String upwd;

    @NotBlank(message = "전화번호를 입력해주십시오.")
    private String upno;

    @NotBlank(message = "시도를 설정해주십시오.")
    private String City;

    @NotBlank(message = "시군구를 설정해주십시오.")
    private String counTry;

    @NotBlank(message = "동읍를 설정해주십시오.")
    private String toWn;

    @NotBlank(message = "생일을 설정해주십시오.")
    private String ubday;

}
