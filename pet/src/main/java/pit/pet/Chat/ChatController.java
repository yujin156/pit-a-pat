package pit.pet.Chat;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    private final ChatService chatService;

    /**
     * 채팅창 페이지 표시 (새 창으로 열림)
     */
    @GetMapping("/chat/{friendRequestId}")
    public String showChatWindow(@PathVariable Long friendRequestId,
                                 @AuthenticationPrincipal UserDetails principal,
                                 Model model) {
        if (principal == null) {
            return "redirect:/user/login";
        }

        try {
            // 채팅 접근 권한 확인을 위해 메시지 조회
            List<ChatMessage> messages = chatService.getChatMessages(principal.getUsername(), friendRequestId);

            model.addAttribute("friendRequestId", friendRequestId);
            model.addAttribute("messages", messages);

            // 메시지 읽음 처리
            chatService.markMessagesAsRead(principal.getUsername(), friendRequestId);

            return "Chat/Chat";

        } catch (Exception e) {
            log.error("채팅창 로드 실패: {}", e.getMessage());
            model.addAttribute("error", "채팅방에 접근할 수 없습니다.");
            return "error/403";
        }
    }

    /**
     * 채팅 메시지 목록 조회 (AJAX)
     */
    @GetMapping("/api/chat/{friendRequestId}/messages")
    @ResponseBody
    public ResponseEntity<?> getChatMessages(@PathVariable Long friendRequestId,
                                             @AuthenticationPrincipal UserDetails principal) {
        try {
            if (principal == null) {
                return ResponseEntity.ok(Map.of(
                        "success", false,
                        "message", "로그인이 필요합니다."
                ));
            }

            List<ChatMessage> messages = chatService.getChatMessages(principal.getUsername(), friendRequestId);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "messages", messages
            ));

        } catch (Exception e) {
            log.error("채팅 메시지 조회 실패: {}", e.getMessage());
            return ResponseEntity.ok(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * 채팅 메시지 전송 (AJAX)
     */
    @PostMapping("/api/chat/{friendRequestId}/send")
    @ResponseBody
    public ResponseEntity<?> sendMessage(@PathVariable Long friendRequestId,
                                         @RequestBody Map<String, String> request,
                                         @AuthenticationPrincipal UserDetails principal) {
        try {
            if (principal == null) {
                return ResponseEntity.ok(Map.of(
                        "success", false,
                        "message", "로그인이 필요합니다."
                ));
            }

            String message = request.get("message");
            if (message == null || message.trim().isEmpty()) {
                return ResponseEntity.ok(Map.of(
                        "success", false,
                        "message", "메시지 내용을 입력해주세요."
                ));
            }

            ChatMessage chatMessage = chatService.sendMessage(
                    principal.getUsername(),
                    friendRequestId,
                    message.trim()
            );

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", chatMessage
            ));

        } catch (Exception e) {
            log.error("메시지 전송 실패: {}", e.getMessage());
            return ResponseEntity.ok(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * 읽지 않은 메시지 개수 조회 (AJAX)
     */
    @GetMapping("/api/chat/{friendRequestId}/unread-count")
    @ResponseBody
    public ResponseEntity<?> getUnreadCount(@PathVariable Long friendRequestId,
                                            @AuthenticationPrincipal UserDetails principal) {
        try {
            if (principal == null) {
                return ResponseEntity.ok(Map.of(
                        "success", false,
                        "count", 0
                ));
            }

            long unreadCount = chatService.getUnreadMessageCount(principal.getUsername(), friendRequestId);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "count", unreadCount
            ));

        } catch (Exception e) {
            log.error("읽지 않은 메시지 개수 조회 실패: {}", e.getMessage());
            return ResponseEntity.ok(Map.of(
                    "success", false,
                    "count", 0
            ));
        }
    }

    /**
     * 메시지 읽음 처리 (AJAX)
     */
    @PostMapping("/api/chat/{friendRequestId}/mark-read")
    @ResponseBody
    public ResponseEntity<?> markAsRead(@PathVariable Long friendRequestId,
                                        @AuthenticationPrincipal UserDetails principal) {
        try {
            if (principal == null) {
                return ResponseEntity.ok(Map.of(
                        "success", false,
                        "message", "로그인이 필요합니다."
                ));
            }

            chatService.markMessagesAsRead(principal.getUsername(), friendRequestId);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "읽음 처리 완료"
            ));

        } catch (Exception e) {
            log.error("메시지 읽음 처리 실패: {}", e.getMessage());
            return ResponseEntity.ok(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * 마지막 메시지 조회 (AJAX)
     */
    @GetMapping("/api/chat/{friendRequestId}/last-message")
    @ResponseBody
    public ResponseEntity<?> getLastMessage(@PathVariable Long friendRequestId,
                                            @AuthenticationPrincipal UserDetails principal) {
        try {
            if (principal == null) {
                return ResponseEntity.ok(Map.of(
                        "success", false,
                        "message", "로그인이 필요합니다."
                ));
            }

            Optional<ChatMessage> lastMessage = chatService.getLastMessage(friendRequestId);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "lastMessage", lastMessage.orElse(null)
            ));

        } catch (Exception e) {
            log.error("마지막 메시지 조회 실패: {}", e.getMessage());
            return ResponseEntity.ok(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * WebSocket 메시지 핸들러
     */
    @MessageMapping("/chat/{friendRequestId}")
    @SendTo("/topic/chat/{friendRequestId}")
    public ChatService.ChatMessageDto handleChatMessage(
            @DestinationVariable Long friendRequestId,
            ChatMessageRequest messageRequest) {

        try {
            ChatMessage chatMessage = chatService.sendMessage(
                    messageRequest.getSenderEmail(),
                    friendRequestId,
                    messageRequest.getMessage()
            );

            return ChatService.ChatMessageDto.builder()
                    .id(chatMessage.getId())
                    .senderDogId(chatMessage.getSenderDog().getDno())
                    .senderDogName(chatMessage.getSenderDog().getDname())
                    .message(chatMessage.getMessage())
                    .messageType(chatMessage.getMessageType().toString())
                    .sentAt(chatMessage.getSentAt())
                    .isRead(chatMessage.getIsRead())
                    .build();

        } catch (Exception e) {
            log.error("WebSocket 메시지 처리 실패: {}", e.getMessage());
            return null;
        }
    }

    /**
     * WebSocket 메시지 요청 DTO
     */
    @lombok.Data
    public static class ChatMessageRequest {
        private String senderEmail;
        private String message;
    }
}