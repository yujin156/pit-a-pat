package pit.pet.Account.User;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import com.fasterxml.jackson.annotation.JsonBackReference;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
public class Dogimg {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long dino;

    @Column(name="di_title",nullable = false)
    private String dititle;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dno", nullable = false, unique = true)
    @JsonBackReference("dog-image")
    private Dog dog;

    @Column(name = "di_url", nullable = false)
    private String diurl;

    @CreationTimestamp
    @Column(name = "di_uploaded_at", nullable = false)
    private LocalDateTime di_uploaded_at;
}