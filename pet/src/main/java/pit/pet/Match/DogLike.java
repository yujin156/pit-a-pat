package pit.pet.Match;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import pit.pet.Account.User.Dog;

import java.time.LocalDateTime;

@Entity
@Table(name = "dog_like",
        uniqueConstraints = @UniqueConstraint(columnNames = {"sender_dog_id", "receiver_dog_id"}))
@Getter @Setter @NoArgsConstructor
public class DogLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "like_id")
    private Long likeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_dog_id", nullable = false)
    private Dog senderDog;  // 좋아요를 보내는 강아지

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_dog_id", nullable = false)
    private Dog receiverDog;  // 좋아요를 받는 강아지

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}