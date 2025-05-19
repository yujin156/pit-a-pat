package pit.pet.Security.JWT;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TokenDto {
    private String accessToken;
    private String refreshToken;
}
