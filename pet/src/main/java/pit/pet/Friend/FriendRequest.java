package pit.pet.Friend;

import jakarta.persistence.*;
import lombok.*;
import pit.pet.Account.User.Dog;


import java.time.LocalDateTime;

// FriendRequest.java
@Entity
@Table(name = "friend_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FriendRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_dno", nullable = false)
    private Dog requester;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_dno", nullable = false)
    private Dog receiver;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus status;  // PENDING, ACCEPTED, REJECTED

    @Column(nullable = false)
    private LocalDateTime requestedAt;
}