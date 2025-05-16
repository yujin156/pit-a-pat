package pit.pet.Account.Service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import pit.pet.Account.Repository.AddressRepository;
import pit.pet.Account.Repository.UserRepository;
import pit.pet.Account.Request.RegisterRequest;
import pit.pet.Account.User.*;

@Service
@RequiredArgsConstructor
public class RegisterService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AddressRepository AddressRepository;

    @Transactional
    public User userRegister(RegisterRequest request) {
        if(userRepository.existsByumail(request.getUemail())){
            throw new RuntimeException("이미 가입되어 있는 이메일입니다.");
        }

        User user = new User();
        Address address = AddressRepository.findByCityAndCountyAndTown(
                request.getCity(),
                request.getCounTry(),
                request.getToWn()
        ).orElseThrow(() -> new RuntimeException("주소 정보가 존재하지 않습니다."));


        user.setUname(request.getUname());
        user.setUemail(request.getUemail());
        user.setUpwd(passwordEncoder.encode(request.getUpwd()));
        user.setUgender(Gender.fromUserLabel(request.getUGender()));
        user.setUpno(Integer.parseInt(request.getUpno()));
        user.setAddress(address);

        return userRepository.save(user);

    }
}
