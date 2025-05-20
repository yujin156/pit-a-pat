package pit.pet.Account.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String from;
    @Value("${app.mail.code.subject}")
    private String subject;
    @Value("${app.mail.code.body}")
    private String bodyTemplate;
    @Value("${app.security.code.expiration}")
    private int expirationMinutes;

    public void sendCode(String toEmail, String code) throws MessagingException {
        String body = bodyTemplate
                .replace("{code}", code)
                .replace("{expiration}", String.valueOf(expirationMinutes));

        // 1) MimeMessage 생성
        MimeMessage message = mailSender.createMimeMessage();
        // 2) UTF-8 인코딩 설정
        MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");

        helper.setFrom(from);
        helper.setTo(toEmail);
        helper.setSubject(subject);
        helper.setText(body, false);  // 두 번째 파라미터가 true면 HTML, false면 plain text

        mailSender.send(message);
    }
}
