package pit.pet.chat.model;

import jakarta.persistence.*;
import lombok.*;
import pit.pet.Account.User.Dog;
import pit.pet.Account.User.Profile;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "matching_chat")
public class MatchingChat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long mno;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_dog_id")
    private Dog senderDId;  // 보내는 강아지

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_dog_id")
    private Dog receiverDId;  // 받는 강아지

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id")
    private Profile profile;

    @Column(name = "m_chat", nullable = false)
    private String mChat;

    @Column(name = "m_nowdate", nullable = false)
    private LocalDateTime mNowdate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MessageType type;

    public enum MessageType {
        ENTER, TALK, LEAVE, FIRST_MSG
    }

    @PrePersist
    protected void onCreate() {
        this.mNowdate = LocalDateTime.now();
    }
}