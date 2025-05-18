package pit.pet.chat.DTO;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageResponseDto {
    private Long senderDId;            // 보내는 강아지 ID
    private String senderDogName;      // 보내는 강아지 이름
    private String senderDogProfile;   // 보내는 강아지 프로필 이미지

    private Long receiverDId;          // 받는 강아지 ID
    private String receiverDogName;    // 받는 강아지 이름
    private String receiverDogProfile; // 받는 강아지 프로필 이미지

    private String mChat;              // 메시지 내용
    private String mNowdate;           // 메시지 보낸 시간
    private MessageType type;          // 메시지 타입

    public enum MessageType {
        ENTER, TALK, LEAVE, FIRST_MSG
    }
}