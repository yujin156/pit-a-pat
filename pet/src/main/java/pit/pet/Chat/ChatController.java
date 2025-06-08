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
import pit.pet.Account.Repository.DogRepository;
import pit.pet.Account.Repository.UserRepository;
import pit.pet.Account.User.Dog;
import pit.pet.Account.User.User;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    private final ChatService chatService;
    private final UserRepository userRepository;
    private final DogRepository dogRepository;

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
            log.info("=== 채팅창 로드 시작 ===");
            log.info("friendRequestId: {}, user: {}", friendRequestId, principal.getUsername());

            // 현재 사용자 정보 가져오기
            User currentUser = userRepository.findByUemail(principal.getUsername())
                    .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

            List<Dog> myDogs = dogRepository.findByOwner(currentUser);
            if (myDogs.isEmpty()) {
                throw new RuntimeException("등록된 강아지가 없습니다.");
            }

            Dog myDog = myDogs.get(0);

            // 상대방 강아지 정보 가져오기
            Dog partnerDog = chatService.getPartnerDog(friendRequestId, myDog.getDno());

            // 채팅 메시지 조회
            List<ChatMessage> messages = chatService.getChatMessages(principal.getUsername(), friendRequestId);

            model.addAttribute("friendRequestId", friendRequestId);
            model.addAttribute("messages", messages);
            model.addAttribute("myDog", myDog);
            model.addAttribute("partnerDog", partnerDog);

            // 메시지 읽음 처리
            chatService.markMessagesAsRead(principal.getUsername(), friendRequestId);

            log.info("=== 채팅창 로드 성공 ===");
            return "Chat/chat";  // ✅ 정상 경로

        } catch (Exception e) {
            log.error("채팅창 로드 실패: {}", e.getMessage(), e);

            // ✅ 에러 발생시에도 같은 템플릿 사용하되 에러 정보만 추가
            model.addAttribute("error", "채팅방에 접근할 수 없습니다: " + e.getMessage());
            model.addAttribute("friendRequestId", friendRequestId);
            model.addAttribute("partnerDog", null);  // null로 설정
            model.addAttribute("myDog", null);
            model.addAttribute("messages", new ArrayList<>());

            return "Chat/chat";  // ✅ 동일한 템플릿 사용
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