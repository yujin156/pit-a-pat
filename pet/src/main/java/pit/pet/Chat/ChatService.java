package pit.pet.Chat;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pit.pet.Account.Repository.DogRepository;
import pit.pet.Account.Repository.UserRepository;
import pit.pet.Account.User.Dog;
import pit.pet.Account.User.User;
import pit.pet.Friend.FriendRequest;
import pit.pet.Friend.FriendRequestRepository;
import pit.pet.Friend.RequestStatus;


import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final FriendRequestRepository friendRequestRepository;
    private final DogRepository dogRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * 채팅 메시지 전송
     */
    @Transactional
    public ChatMessage sendMessage(String senderEmail, Long friendRequestId, String messageContent) {
        log.info("메시지 전송 요청 - sender: {}, friendRequestId: {}, message: {}", senderEmail, friendRequestId, messageContent);

        // 발신자 확인
        User senderUser = userRepository.findByUemail(senderEmail)
                .orElseThrow(() -> new RuntimeException("발신자를 찾을 수 없습니다."));

        List<Dog> senderDogs = dogRepository.findByOwner(senderUser);
        if (senderDogs.isEmpty()) {
            throw new RuntimeException("발신자의 강아지 정보가 없습니다.");
        }
        Dog senderDog = senderDogs.get(0); // 첫 번째 강아지 사용

        // 친구 관계 확인
        FriendRequest friendRequest = friendRequestRepository.findById(friendRequestId)
                .orElseThrow(() -> new RuntimeException("친구 관계를 찾을 수 없습니다."));

        if (friendRequest.getStatus() != RequestStatus.ACCEPTED) {
            throw new RuntimeException("친구 관계가 성립되지 않았습니다.");
        }

        // 발신자가 해당 친구 관계에 포함되는지 확인
        if (!friendRequest.getRequester().getDno().equals(senderDog.getDno()) &&
                !friendRequest.getReceiver().getDno().equals(senderDog.getDno())) {
            throw new RuntimeException("해당 채팅방에 참여할 권한이 없습니다.");
        }

        // 메시지 저장
        ChatMessage chatMessage = ChatMessage.builder()
                .friendRequest(friendRequest)
                .senderDog(senderDog)
                .message(messageContent)
                .messageType(ChatMessage.MessageType.TEXT)
                .sentAt(LocalDateTime.now())
                .isRead(false)
                .build();

        ChatMessage savedMessage = chatMessageRepository.save(chatMessage);

        // 실시간 메시지 전송 (WebSocket)
        sendRealTimeMessage(friendRequest, savedMessage);

        log.info("메시지 전송 완료: {} -> 채팅방 {}", senderDog.getDname(), friendRequestId);
        return savedMessage;
    }

    // ChatService.java에 추가
    @Transactional(readOnly = true)
    public Map<String, Object> getChatData(Long friendRequestId, String userEmail) {
        Map<String, Object> result = new HashMap<>();

        try {
            // 사용자 조회
            User currentUser = userRepository.findByUemail(userEmail)
                    .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

            List<Dog> myDogs = dogRepository.findByOwner(currentUser);
            if (myDogs.isEmpty()) {
                throw new RuntimeException("등록된 강아지가 없습니다.");
            }

            Dog myDog = myDogs.get(0);

            // 상대방 강아지 조회
            Dog partnerDog = getPartnerDog(friendRequestId, myDog.getDno());

            // 메시지 조회
            List<ChatMessage> messages = getChatMessages(userEmail, friendRequestId);

            result.put("myDog", myDog);
            result.put("partnerDog", partnerDog);
            result.put("messages", messages);

            return result;

        } catch (Exception e) {
            log.error("채팅 데이터 조회 실패: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * 상대방 강아지 정보 가져오기
     */
    @Transactional(readOnly = true)
    public Dog getPartnerDog(Long friendRequestId, Long myDogId) {
        log.info("상대방 강아지 정보 조회 - friendRequestId: {}, myDogId: {}", friendRequestId, myDogId);

        try {
            FriendRequest friendRequest = friendRequestRepository.findById(friendRequestId)
                    .orElseThrow(() -> new RuntimeException("친구 관계를 찾을 수 없습니다. ID: " + friendRequestId));

            log.info("FriendRequest 조회 성공 - Status: {}", friendRequest.getStatus());
            log.info("Requester: {} (ID: {})", friendRequest.getRequester().getDname(), friendRequest.getRequester().getDno());
            log.info("Receiver: {} (ID: {})", friendRequest.getReceiver().getDname(), friendRequest.getReceiver().getDno());

            // 상태 확인
            if (friendRequest.getStatus() != RequestStatus.ACCEPTED) {
                throw new RuntimeException("친구 관계가 성립되지 않았습니다. 현재 상태: " + friendRequest.getStatus());
            }

            // 내가 requester인지 receiver인지 확인하여 상대방 강아지 반환
            Dog partnerDog;
            if (friendRequest.getRequester().getDno().equals(myDogId)) {
                partnerDog = friendRequest.getReceiver();
                log.info("내가 요청자 - 상대방: {}", partnerDog.getDname());
            } else if (friendRequest.getReceiver().getDno().equals(myDogId)) {
                partnerDog = friendRequest.getRequester();
                log.info("내가 수신자 - 상대방: {}", partnerDog.getDname());
            } else {
                log.error("권한 없음 - myDogId: {}, requesterDogId: {}, receiverDogId: {}",
                        myDogId, friendRequest.getRequester().getDno(), friendRequest.getReceiver().getDno());
                throw new RuntimeException("해당 채팅방에 참여할 권한이 없습니다.");
            }

            log.info("상대방 강아지 조회 성공: {}", partnerDog.getDname());
            return partnerDog;

        } catch (Exception e) {
            log.error("상대방 강아지 조회 실패: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * 채팅방의 모든 메시지 조회
     */
    @Transactional(readOnly = true)
    public List<ChatMessage> getChatMessages(String userEmail, Long friendRequestId) {
        log.info("채팅 메시지 조회 - user: {}, friendRequestId: {}", userEmail, friendRequestId);

        // 사용자 권한 확인
        validateChatAccess(userEmail, friendRequestId);

        FriendRequest friendRequest = friendRequestRepository.findById(friendRequestId)
                .orElseThrow(() -> new RuntimeException("친구 관계를 찾을 수 없습니다."));

        List<ChatMessage> messages = chatMessageRepository.findByFriendRequestOrderBySentAtAsc(friendRequest);
        log.info("조회된 메시지 수: {}", messages.size());

        return messages;
    }

    /**
     * 메시지 읽음 처리
     */
    @Transactional
    public void markMessagesAsRead(String userEmail, Long friendRequestId) {
        log.info("메시지 읽음 처리 - user: {}, friendRequestId: {}", userEmail, friendRequestId);

        User currentUser = userRepository.findByUemail(userEmail)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        List<Dog> myDogs = dogRepository.findByOwner(currentUser);
        if (myDogs.isEmpty()) {
            throw new RuntimeException("강아지 정보가 없습니다.");
        }
        Dog myDog = myDogs.get(0);

        FriendRequest friendRequest = friendRequestRepository.findById(friendRequestId)
                .orElseThrow(() -> new RuntimeException("친구 관계를 찾을 수 없습니다."));

        // 내가 받은 읽지 않은 메시지들을 읽음 처리
        List<ChatMessage> unreadMessages = chatMessageRepository
                .findUnreadMessages(friendRequest, myDog);

        for (ChatMessage message : unreadMessages) {
            message.setIsRead(true);
        }

        chatMessageRepository.saveAll(unreadMessages);
        log.info("메시지 읽음 처리 완료: 채팅방 {}, 강아지 {}, 처리된 메시지 수: {}",
                friendRequestId, myDog.getDname(), unreadMessages.size());
    }

    /**
     * 읽지 않은 메시지 개수 조회
     */
    @Transactional(readOnly = true)
    public long getUnreadMessageCount(String userEmail, Long friendRequestId) {
        try {
            User currentUser = userRepository.findByUemail(userEmail)
                    .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

            List<Dog> myDogs = dogRepository.findByOwner(currentUser);
            if (myDogs.isEmpty()) {
                return 0;
            }
            Dog myDog = myDogs.get(0);

            FriendRequest friendRequest = friendRequestRepository.findById(friendRequestId)
                    .orElseThrow(() -> new RuntimeException("친구 관계를 찾을 수 없습니다."));

            return chatMessageRepository.countUnreadMessages(friendRequest, myDog);
        } catch (Exception e) {
            log.error("읽지 않은 메시지 개수 조회 실패: {}", e.getMessage());
            return 0;
        }
    }

    /**
     * 마지막 메시지 조회
     */
    @Transactional(readOnly = true)
    public Optional<ChatMessage> getLastMessage(Long friendRequestId) {
        try {
            FriendRequest friendRequest = friendRequestRepository.findById(friendRequestId)
                    .orElseThrow(() -> new RuntimeException("친구 관계를 찾을 수 없습니다."));

            ChatMessage lastMessage = chatMessageRepository.findLastMessage(friendRequest);
            return Optional.ofNullable(lastMessage);
        } catch (Exception e) {
            log.error("마지막 메시지 조회 실패: {}", e.getMessage());
            return Optional.empty();
        }
    }

    /**
     * 채팅방 접근 권한 확인
     */
    private void validateChatAccess(String userEmail, Long friendRequestId) {
        User currentUser = userRepository.findByUemail(userEmail)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        List<Dog> myDogs = dogRepository.findByOwner(currentUser);
        if (myDogs.isEmpty()) {
            throw new RuntimeException("강아지 정보가 없습니다.");
        }
        Dog myDog = myDogs.get(0);

        FriendRequest friendRequest = friendRequestRepository.findById(friendRequestId)
                .orElseThrow(() -> new RuntimeException("친구 관계를 찾을 수 없습니다."));

        if (friendRequest.getStatus() != RequestStatus.ACCEPTED) {
            throw new RuntimeException("친구 관계가 성립되지 않았습니다.");
        }

        if (!friendRequest.getRequester().getDno().equals(myDog.getDno()) &&
                !friendRequest.getReceiver().getDno().equals(myDog.getDno())) {
            throw new RuntimeException("해당 채팅방에 접근할 권한이 없습니다.");
        }
    }

    /**
     * 실시간 메시지 전송 (WebSocket)
     */
    private void sendRealTimeMessage(FriendRequest friendRequest, ChatMessage chatMessage) {
        try {
            // 채팅방 구독자들에게 메시지 전송
            String destination = "/topic/chat/" + friendRequest.getId();

            ChatMessageDto messageDto = ChatMessageDto.builder()
                    .id(chatMessage.getId())
                    .senderDogId(chatMessage.getSenderDog().getDno())
                    .senderDogName(chatMessage.getSenderDog().getDname())
                    .message(chatMessage.getMessage())
                    .messageType(chatMessage.getMessageType().toString())
                    .sentAt(chatMessage.getSentAt())
                    .isRead(chatMessage.getIsRead())
                    .build();

            messagingTemplate.convertAndSend(destination, messageDto);
            log.info("실시간 메시지 전송 완료: {}", destination);
        } catch (Exception e) {
            log.error("실시간 메시지 전송 실패: {}", e.getMessage());
        }
    }

    /**
     * 채팅 메시지 DTO
     */
    @lombok.Data
    @lombok.Builder
    public static class ChatMessageDto {
        private Long id;
        private Long senderDogId;
        private String senderDogName;
        private String message;
        private String messageType;
        private LocalDateTime sentAt;
        private Boolean isRead;
    }
}