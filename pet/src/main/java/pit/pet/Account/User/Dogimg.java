package pit.pet.Account.User;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "dogimgTable")
public class Dogimg {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int dino;

    @OneToOne
    @JoinColumn(name = "dno", nullable = false)
    private Dog dog;

    @Column(name = "di_url", nullable = false)
    private String di_url;

    @Column(name = "di_title", nullable = false)
    private String di_title;

    @CreationTimestamp
    @Column(name = "di_uploaded_at", nullable = false)
    private LocalDateTime di_uploaded_at;
}
