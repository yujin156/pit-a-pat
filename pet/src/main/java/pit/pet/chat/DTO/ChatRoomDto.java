package pit.pet.chat.DTO;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoomDto {
    private String roomId;          // 채팅방 고유 ID
    private Long dog1Id;            // 첫 번째 강아지 ID
    private String dog1Name;        // 첫 번째 강아지 이름
    private String dog1ProfileUrl;  // 첫 번째 강아지 프로필 이미지

    private Long dog2Id;            // 두 번째 강아지 ID
    private String dog2Name;        // 두 번째 강아지 이름
    private String dog2ProfileUrl;  // 두 번째 강아지 프로필 이미지

    private String lastMessage;     // 마지막 메시지 내용
    private LocalDateTime lastMessageTime; // 마지막 메시지 시간
}