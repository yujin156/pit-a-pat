package pit.pet.Account.User;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class TOSTable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tosNo")
    private Long tosNo; // 약관 동의 고유 번호

    @Column(name = "assent", nullable = false)
    private Boolean assent; // 이용약관 동의 여부

    @Column(name = "tou", nullable = false)
    private Boolean privacyAgree; // 개인정보 처리방침 동의 여부

    @Column(name = "marketing_agree")
    private Boolean marketingAgree; // 마케팅 수신 동의 여부 (선택)

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uno")
    @JsonBackReference("user-tosTable")
    private User user;
}
