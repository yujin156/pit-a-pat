package pit.pet.chat.Controller;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;
import pit.pet.chat.DTO.ChatMessageRequestDto;
import pit.pet.chat.DTO.ChatMessageResponseDto;
import pit.pet.chat.Service.ChatService;

@Controller
@RequiredArgsConstructor
public class ChatController {
    private final SimpMessageSendingOperations messagingTemplate;
    private final ChatService chatService;

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(ChatMessageRequestDto requestDto) {
        System.out.println("메시지 수신: " + requestDto.getMChat() +
                " (발신자: " + requestDto.getSenderDId() +
                " → 수신자: " + requestDto.getReceiverDId() + ")");

        try {
            // 메시지 저장 및 응답 DTO 생성
            ChatMessageResponseDto responseDto = chatService.saveMessage(requestDto);

            // 중요: 수신자 ID로 메시지 전송
            messagingTemplate.convertAndSend("/topic/chat/" + requestDto.getReceiverDId(), responseDto);

            System.out.println("메시지 전송 완료: 대상 /topic/chat/" + requestDto.getReceiverDId());
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("메시지 처리 중 오류: " + e.getMessage());
        }
    }
}