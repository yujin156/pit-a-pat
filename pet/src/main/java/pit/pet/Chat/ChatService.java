//package pit.pet.Chat;
//
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.messaging.simp.SimpMessagingTemplate;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//import pit.pet.Account.Repository.DogRepository;
//import pit.pet.Account.Repository.UserRepository;
//import pit.pet.Account.User.Dog;
//import pit.pet.Account.User.User;
//import pit.pet.Friend.FriendRequest;
//import pit.pet.Friend.FriendRequestRepository;
//import pit.pet.Friend.RequestStatus;
//
//
//import java.time.LocalDateTime;
//import java.util.List;
//import java.util.Optional;
//
//@Service
//@RequiredArgsConstructor
//@Transactional
//@Slf4j
//public class ChatService {
//
//    private final ChatMessageRepository chatMessageRepository;
//    private final FriendRequestRepository friendRequestRepository;
//    private final DogRepository dogRepository;
//    private final UserRepository userRepository;
//    private final SimpMessagingTemplate messagingTemplate;
//
//    /**
//     * 채팅 메시지 전송
//     */
//    @Transactional
//    public ChatMessage sendMessage(String senderEmail, Long friendRequestId, String messageContent) {
//        // 발신자 확인
//        User senderUser = userRepository.findByUemail(senderEmail)
//                .orElseThrow(() -> new RuntimeException("발신자를 찾을 수 없습니다."));
//
//        List<Dog> senderDogs = dogRepository.findByOwner(senderUser);
//        if (senderDogs.isEmpty()) {
//            throw new RuntimeException("발신자의 강아지 정보가 없습니다.");
//        }
//        Dog senderDog = senderDogs.get(0);
//
//        // 친구 관계 확인
//        FriendRequest friendRequest = friendRequestRepository.findById(friendRequestId)
//                .orElseThrow(() -> new RuntimeException("친구 관계를 찾을 수 없습니다."));
//
//        if (friendRequest.getStatus() != RequestStatus.ACCEPTED) {
//            throw new RuntimeException("친구 관계가 성립되지 않았습니다.");
//        }
//
//        // 발신자가 해당 친구 관계에 포함되는지 확인
//        if (!friendRequest.getRequester().getDno().equals(senderDog.getDno()) &&
//                !friendRequest.getReceiver().getDno().equals(senderDog.getDno())) {
//            throw new RuntimeException("해당 채팅방에 참여할 권한이 없습니다.");
//        }
//
//        // 메시지 저장
//        ChatMessage chatMessage = ChatMessage.builder()
//                .friendRequest(friendRequest)
//                .senderDog(senderDog)
//                .message(messageContent)
//                .messageType(ChatMessage.MessageType.TEXT)
//                .sentAt(LocalDateTime.now())
//                .isRead(false)
//                .build();
//
//        ChatMessage savedMessage = chatMessageRepository.save(chatMessage);
//
//        // 실시간 메시지 전송 (WebSocket)
//        sendRealTimeMessage(friendRequest, savedMessage);
//
//        log.info("메시지 전송: {} -> 채팅방 {}", senderDog.getDname(), friendRequestId);
//        return savedMessage;
//    }
//
//    /**
//     * 채팅방의 모든 메시지 조회
//     */
//    @Transactional(readOnly = true)
//    public List<ChatMessage> getChatMessages(String userEmail, Long friendRequestId) {
//        // 사용자 권한 확인
//        validateChatAccess(userEmail, friendRequestId);
//
//        FriendRequest friendRequest = friendRequestRepository.findById(friendRequestId)
//                .orElseThrow(() -> new RuntimeException("친구 관계를 찾을 수 없습니다."));
//
//        return chatMessageRepository.findByFriendRequestOrderBySentAtAsc(friendRequest);
//    }
//
//    /**
//     * 메시지 읽음 처리
//     */
//    @Transactional
//    public void markMessagesAsRead(String userEmail, Long friendRequestId) {
//        User currentUser = userRepository.findByUemail(userEmail)
//                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
//
//        List<Dog> myDogs = dogRepository.findByOwner(currentUser);
//        if (myDogs.isEmpty()) {
//            throw new RuntimeException("강아지 정보가 없습니다.");
//        }
//        Dog myDog = myDogs.get(0);
//
//        FriendRequest friendRequest = friendRequestRepository.findById(friendRequestId)
//                .orElseThrow(() -> new RuntimeException("친구 관계를 찾을 수 없습니다."));
//
//        // 내가 받은 읽지 않은 메시지들을 읽음 처리
//        List<ChatMessage> unreadMessages = chatMessageRepository
//                .findUnreadMessages(friendRequest, myDog);
//
//        for (ChatMessage message : unreadMessages) {
//            message.setIsRead(true);
//        }
//
//        chatMessageRepository.saveAll(unreadMessages);
//        log.info("메시지 읽음 처리: 채팅방 {}, 강아지 {}", friendRequestId, myDog.getDname());
//    }
//
//    /**
//     * 읽지 않은 메시지 개수 조회
//     */
//    @Transactional(readOnly = true)
//    public long getUnreadMessageCount(String userEmail, Long friendRequestId) {
//        User currentUser = userRepository.findByUemail(userEmail)
//                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
//
//        List<Dog> myDogs = dogRepository.findByOwner(currentUser);
//        if (myDogs.isEmpty()) {
//            return 0;
//        }
//        Dog myDog = myDogs.get(0);
//
//        FriendRequest friendRequest = friendRequestRepository.findById(friendRequestId)
//                .orElseThrow(() -> new RuntimeException("친구 관계를 찾을 수 없습니다."));
//
//        return chatMessageRepository.countUnreadMessages(friendRequest, myDog);
//    }
//
//    /**
//     * 마지막 메시지 조회
//     */
//    @Transactional(readOnly = true)
//    public Optional<ChatMessage> getLastMessage(Long friendRequestId) {
//        FriendRequest friendRequest = friendRequestRepository.findById(friendRequestId)
//                .orElseThrow(() -> new RuntimeException("친구 관계를 찾을 수 없습니다."));
//
//        ChatMessage lastMessage = chatMessageRepository.findLastMessage(friendRequest);
//        return Optional.ofNullable(lastMessage);
//    }
//
//    /**
//     * 채팅방 접근 권한 확인
//     */
//    private void validateChatAccess(String userEmail, Long friendRequestId) {
//        User currentUser = userRepository.findByUemail(userEmail)
//                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
//
//        List<Dog> myDogs = dogRepository.findByOwner(currentUser);
//        if (myDogs.isEmpty()) {
//            throw new RuntimeException("강아지 정보가 없습니다.");
//        }
//        Dog myDog = myDogs.get(0);
//
//        FriendRequest friendRequest = friendRequestRepository.findById(friendRequestId)
//                .orElseThrow(() -> new RuntimeException("친구 관계를 찾을 수 없습니다."));
//
//        if (friendRequest.getStatus() != RequestStatus.ACCEPTED) {
//            throw new RuntimeException("친구 관계가 성립되지 않았습니다.");
//        }
//
//        if (!friendRequest.getRequester().getDno().equals(myDog.getDno()) &&
//                !friendRequest.getReceiver().getDno().equals(myDog.getDno())) {
//            throw new RuntimeException("해당 채팅방에 접근할 권한이 없습니다.");
//        }
//    }
//
//    /**
//     * 실시간 메시지 전송 (WebSocket)
//     */
//    private void sendRealTimeMessage(FriendRequest friendRequest, ChatMessage chatMessage) {
//        try {
//            // 채팅방 구독자들에게 메시지 전송
//            String destination = "/topic/chat/" + friendRequest.getId();
//
//            ChatMessageDto messageDto = ChatMessageDto.builder()
//                    .id(chatMessage.getId())
//                    .senderDogId(chatMessage.getSenderDog().getDno())
//                    .senderDogName(chatMessage.getSenderDog().getDname())
//                    .message(chatMessage.getMessage())
//                    .messageType(chatMessage.getMessageType().toString())
//                    .sentAt(chatMessage.getSentAt())
//                    .isRead(chatMessage.getIsRead())
//                    .build();
//
//            messagingTemplate.convertAndSend(destination, messageDto);
//        } catch (Exception e) {
//            log.error("실시간 메시지 전송 실패: {}", e.getMessage());
//        }
//    }
//
//    /**
//     * 채팅 메시지 DTO
//     */
//    @lombok.Data
//    @lombok.Builder
//    public static class ChatMessageDto {
//        private Long id;
//        private Long senderDogId;
//        private String senderDogName;
//        private String message;
//        private String messageType;
//        private LocalDateTime sentAt;
//        private Boolean isRead;
//    }
//}