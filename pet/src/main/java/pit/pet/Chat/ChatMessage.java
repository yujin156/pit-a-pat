package pit.pet.Chat;

import jakarta.persistence.*;
import lombok.*;
import pit.pet.Account.User.Dog;
import pit.pet.Friend.FriendRequest;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 친구 관계를 참조 (ACCEPTED 상태인 FriendRequest를 채팅방으로 사용)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "friend_request_id", nullable = false)
    private FriendRequest friendRequest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_dog_id", nullable = false)
    private Dog senderDog;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(name = "message_type")
    private MessageType messageType = MessageType.TEXT;

    @Column(nullable = false)
    private LocalDateTime sentAt;

    @Column(nullable = false)
    private Boolean isRead = false;

    public enum MessageType {
        TEXT, IMAGE
    }
    @PrePersist
    protected void onCreate() {
        sentAt = LocalDateTime.now();
    }
}