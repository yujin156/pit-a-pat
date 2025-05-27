package pit.pet.Account.Request;

import jakarta.validation.constraints.Email;
import java.sql.Date;
import java.util.ArrayList;
import java.util.List;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import pit.pet.Account.User.Gender;
import pit.pet.Account.User.Role;


@Setter
@Getter
public class UserRegisterRequest {

    @Email
    @NotBlank
    private String uemail;

    @NotBlank
    private String upwd;

    @NotBlank
    private String uname;

    @NotNull
    private Gender ugender;

    @NotNull
    private Date uBday;

    @NotBlank // 🔧 int → String으로 변경 + @NotBlank 추가
    private String upno;

    @NotNull
    private Role role;

    @NotBlank
    private String city;

    @NotBlank
    private String county;

    @NotBlank
    private String town;

    private List<DogRegisterRequest> dogs = new ArrayList<>();
}
