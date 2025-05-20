package pit.pet.Account.Service;

import jakarta.mail.MessagingException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import pit.pet.Account.Repository.PasswordResetCodeRepository;
import pit.pet.Account.Repository.UserRepository;
import pit.pet.Account.User.PasswordResetCode;
import pit.pet.Account.User.User;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class PasswordResetService {
    private final UserRepository userRepo;
    private final PasswordResetCodeRepository codeRepo;
    private final EmailService emailService;
    private final BCryptPasswordEncoder passwordEncoder;

    @Value("${app.security.code.expiration}")
    private int expirationMinutes;

    @Transactional
    public void generateAndSendCode(String email) throws MessagingException {
        User user = userRepo.findByUemail(email)
                .orElseThrow(() -> new IllegalArgumentException("등록된 이메일이 아닙니다."));

        // 기존 코드 삭제 (DELETE)
        codeRepo.deleteByEmail(email);

        // 랜덤 6자리 숫자 코드 생성
        String code = String.format("%06d", new SecureRandom().nextInt(1_000_000));
        PasswordResetCode prc = new PasswordResetCode();
        prc.setEmail(email);
        prc.setCode(code);
        prc.setExpiryDate(LocalDateTime.now().plusMinutes(expirationMinutes));

        // 새 코드 저장 (INSERT)
        codeRepo.save(prc);

        // 이메일 발송
        emailService.sendCode(email, code);
    }

    // 2) 코드 검증
    public void validateCode(String email, String code) {
        PasswordResetCode prc = codeRepo.findByEmailAndCode(email, code)
                .orElseThrow(() -> new IllegalArgumentException("잘못된 인증 코드입니다."));
        if (prc.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("인증 코드가 만료되었습니다.");
        }
        // 검증 성공하면 코드 삭제
        codeRepo.delete(prc);
    }

    // 3) 비밀번호 변경
    public void resetPassword(String email, String newPassword) {
        User user = userRepo.findByUemail(email)
                .orElseThrow(() -> new IllegalArgumentException("등록된 이메일이 아닙니다."));
        user.setUpwd(passwordEncoder.encode(newPassword));
        userRepo.save(user);
    }
}
