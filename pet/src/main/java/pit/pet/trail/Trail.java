package pit.pet.trail;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Trail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private Double lengthKm;

    @Column(length = 20)
    private String difficulty; // 예: EASY, MEDIUM, HARD

    private String sidoCode;
    private String sigunguCode;
    private String emdCode;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String pathJson;  // "[{\"lat\":37.5,\"lng\":127.1}, ...]"
}
