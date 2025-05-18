package pit.pet.chat.Service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pit.pet.Account.Repository.DogRepository;
import pit.pet.Account.User.Dog;
import pit.pet.Account.User.Gender;
import pit.pet.chat.DTO.ChatMessageRequestDto;
import pit.pet.chat.DTO.ChatMessageResponseDto;
import pit.pet.chat.Repository.MatchingChatRepository;
import pit.pet.chat.model.MatchingChat;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final MatchingChatRepository matchingChatRepository;
    private final DogRepository dogRepository;

    @Transactional
    public ChatMessageResponseDto saveMessage(ChatMessageRequestDto requestDto) {
        // 1. ID 변환 처리
        int senderDogId = requestDto.getSenderDId().intValue();
        int receiverDogId = requestDto.getReceiverDId().intValue();

        // 2. 강아지 정보 조회 (없으면 테스트용 생성)
        Dog senderDog = getDogById(senderDogId);
        Dog receiverDog = getDogById(receiverDogId);

        // 3. 메시지 객체 생성
        MatchingChat chatMessage = MatchingChat.builder()
                .senderDId(senderDog)
                .receiverDId(receiverDog)
                .mChat(requestDto.getMChat())
                .type(MatchingChat.MessageType.valueOf(requestDto.getType().name()))
                .mNowdate(LocalDateTime.now()) // 현재 시간 설정
                .build();

        // 4. 메시지 저장
        MatchingChat savedMessage = matchingChatRepository.save(chatMessage);
        System.out.println("메시지 저장 완료 ID: " + savedMessage.getMno());

        // 5. 응답 DTO 생성
        return ChatMessageResponseDto.builder()
                .senderDId((long) senderDog.getDno())
                .senderDogName(senderDog.getD_name())
                .senderDogProfile("https://via.placeholder.com/50")
                .receiverDId((long) receiverDog.getDno())
                .receiverDogName(receiverDog.getD_name())
                .receiverDogProfile("https://via.placeholder.com/50")
                .mChat(savedMessage.getMChat())
                .mNowdate(savedMessage.getMNowdate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                .type(ChatMessageResponseDto.MessageType.valueOf(savedMessage.getType().name()))
                .build();
    }

    private Dog getDogById(int dogId) {
        Optional<Dog> dogOpt = dogRepository.findById(dogId);

        if (dogOpt.isPresent()) {
            return dogOpt.get();
        } else {
            return createTestDog(dogId);
        }
    }

    private Dog createTestDog(int dogId) {
        Dog dog = new Dog();
        dog.setDno(dogId); // ID 직접 설정 (DB에서 허용된다면)
        dog.setD_name("테스트 강아지 " + dogId);
        dog.setU_gender(Gender.MALE);
        dog.setD_Bday(new Date()); // 현재 날짜를 생일로 설정
        dog.setD_intro("테스트용 강아지입니다.");

        return dogRepository.save(dog);
    }

    // 채팅 내역 조회 (이 메소드는 기존대로 유지)
    @Transactional(readOnly = true)
    public List<ChatMessageResponseDto> getChatHistory(Long senderDogId, Long receiverDogId) {
        List<MatchingChat> chatMessages = matchingChatRepository.findChatHistory(senderDogId, receiverDogId);

        return chatMessages.stream()
                .map(chat -> {
                    String senderName = chat.getSenderDId() != null ? chat.getSenderDId().getD_name() : "알 수 없음";
                    String receiverName = chat.getReceiverDId() != null ? chat.getReceiverDId().getD_name() : "알 수 없음";

                    return ChatMessageResponseDto.builder()
                            .senderDId((long) chat.getSenderDId().getDno())
                            .senderDogName(senderName)
                            .senderDogProfile("https://via.placeholder.com/50")
                            .receiverDId((long) chat.getReceiverDId().getDno())
                            .receiverDogName(receiverName)
                            .receiverDogProfile("https://via.placeholder.com/50")
                            .mChat(chat.getMChat())
                            .mNowdate(chat.getMNowdate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")))
                            .type(ChatMessageResponseDto.MessageType.valueOf(chat.getType().name()))
                            .build();
                })
                .collect(Collectors.toList());
    }
}