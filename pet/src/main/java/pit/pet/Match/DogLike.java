package pit.pet.Match;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import pit.pet.Account.User.Dog;

import java.time.LocalDateTime;

@Entity
@Table(name = "dog_like",
        uniqueConstraints = @UniqueConstraint(columnNames = {"sender_dog_id", "receiver_dog_id"}))
@Getter @Setter @NoArgsConstructor
@ToString(exclude = {"senderDog", "receiverDog"}) // 순환 참조 방지
public class DogLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "like_id")
    private Long likeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_dog_id", nullable = false)  // 이름은 테이블 컬럼명에 맞게
    private Dog senderDog;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_dog_id", nullable = false)
    private Dog receiverDog;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}