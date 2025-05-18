package pit.pet.chat.DTO;

import lombok.*;
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageRequestDto {
    private Long senderDId;        // 보내는 강아지 ID
    private Long receiverDId;      // 받는 강아지 ID
    private String mChat;          // 메시지 내용
    private MessageType type;      // 메시지 타입

    public enum MessageType {
        ENTER, TALK, LEAVE, FIRST_MSG
    }
}