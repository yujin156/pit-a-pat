package pit.pet.Account.User;

import jakarta.persistence.*;
import lombok.*;
import pit.pet.chat.model.MatchingChat;

import java.util.List;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "profile")
public class Profile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long pno;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "d_no")
    private Dog dno;  // 강아지 넘버

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dog_image_id")
    private Dogimg dino;  // 강아지 이미지

    @Transient  // 영속화하지 않음
    private List<String> dogKeywords;

    // 선택적으로 매칭 채팅 정보 포함 가능
    @OneToMany(mappedBy = "profile")
    private List<MatchingChat> chats;
}