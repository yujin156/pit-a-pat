package pit.pet.Account.Service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import pit.pet.Account.Repository.AddressRepository;
import pit.pet.Account.Repository.UserRepository;
import pit.pet.Account.User.Address;
import pit.pet.Account.User.Role;
import pit.pet.Account.User.User;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final PasswordEncoder passwordEncoder;

    public Long registerUser(User user, Address address) {
        user.setUpwd(passwordEncoder.encode(user.getUpwd())); // 비밀번호 암호화
        user.setRole(Role.USER); // 기본 권한 설정

        // 연관 관계 설정
        address.setUser(user);
        user.setAddress(address);

        // 저장 (Cascade 사용해도 명시적으로 저장하는 것이 안정적)
        userRepository.save(user);
        addressRepository.save(address);

        return user.getUno();
    }
    // 동일 폰 번호 찾기
    public boolean existsByPhone(String phone) {
        return userRepository.existsByUpno(phone);
    }

    // ===== 매칭 기능을 위한 메서드 추가 =====

    /**
     * 이메일로 사용자 조회
     */
    public User findByEmail(String email) {
        Optional<User> userOpt = userRepository.findByUemail(email);
        return userOpt.orElse(null);
    }

    /**
     * 사용자 ID로 조회
     */
    public User findById(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        return userOpt.orElse(null);
    }

    /**
     * 이메일 존재 여부 확인
     */
    public boolean existsByEmail(String email) {
        return userRepository.findByUemail(email).isPresent();
    }

    /**
     * 사용자 정보 업데이트
     */
    public void updateUser(User user) {
        userRepository.save(user);
    }
}