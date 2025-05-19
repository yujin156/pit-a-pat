package pit.pet.chat.Controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import pit.pet.chat.DTO.ChatRoomDto;
import pit.pet.chat.DTO.ChatMessageResponseDto;
import pit.pet.chat.Service.ChatService;

import java.util.List;

//@RestController
//@RequiredArgsConstructor
//@RequestMapping("/api/chat")
//public class ChatRoomController {
//    private final ChatService chatService;
//
//    // 특정 사용자의 모든 채팅방 목록 조회
//    @GetMapping("/rooms/{dogId}")
//    public List<ChatRoomDto> getRooms(@PathVariable Long dogId) {
//        return chatService.getChatRooms(dogId);
//    }
//
//    // 새로운 채팅방 생성
//    @PostMapping("/room")
//    public ChatRoomDto createRoom(@RequestParam Long dog1Id, @RequestParam Long dog2Id) {
//        return chatService.createChatRoom(dog1Id, dog2Id);
//    }
//
//    // 특정 채팅방의 메시지 내역 조회
//    @GetMapping("/room/{dog1Id}/{dog2Id}")
//    public List<ChatMessageResponseDto> getChatHistory(
//            @PathVariable Long dog1Id, @PathVariable Long dog2Id) {
//        return chatService.getChatHistory(dog1Id, dog2Id);
//    }
//}