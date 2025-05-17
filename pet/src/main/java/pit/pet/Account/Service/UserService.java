package pit.pet.Account.Service;


import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import pit.pet.Account.Repository.AddressRepository;
import pit.pet.Account.Repository.UserRepository;
import pit.pet.Account.User.Address;
import pit.pet.Account.User.Role;
import pit.pet.Account.User.User;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final PasswordEncoder passwordEncoder;
    public void registerUser(User user, Address address) {
        user.setUpwd(passwordEncoder.encode(user.getUpwd())); // 비밀번호 암호화
        user.setRole(Role.USER); // 기본 권한 설정

        // 연관 관계 설정
        address.setUser(user);
        user.setAddress(address);

        // 저장 (Cascade 사용해도 명시적으로 저장하는 것이 안정적)
        userRepository.save(user);
        addressRepository.save(address);
    }
}
