package pit.pet.trail;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Trail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private Double lengthKm;

    private String difficulty; // 예: EASY, MEDIUM, HARD

    private String sidoCode;
    private String sigunguCode;
    private String emdCode;

    private Double startLat;     // 시작점 위도
    private Double startLng;     // 시작점 경도
    private Double endLat;       // 종료점 위도
    private Double endLng;       // 종료점 경도
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String pathJson;  // "[{\"lat\":37.5,\"lng\":127.1}, ...]"
}
