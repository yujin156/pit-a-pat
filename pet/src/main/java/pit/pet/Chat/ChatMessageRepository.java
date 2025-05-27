//package pit.pet.Chat;
//
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.data.jpa.repository.Query;
//import org.springframework.data.repository.query.Param;
//import pit.pet.Account.User.Dog;
//import pit.pet.Friend.FriendRequest;
//import java.util.List;
//
//public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
//
//    // 특정 친구 관계의 모든 채팅 메시지 (시간순 정렬)
//    List<ChatMessage> findByFriendRequestOrderBySentAtAsc(FriendRequest friendRequest);
//
//    // 특정 친구 관계의 최근 메시지들 (최신순으로 제한)
//    @Query("SELECT cm FROM ChatMessage cm WHERE cm.friendRequest = :friendRequest " +
//            "ORDER BY cm.sentAt DESC")
//    List<ChatMessage> findRecentMessagesByFriendRequest(@Param("friendRequest") FriendRequest friendRequest);
//
//    // 읽지 않은 메시지 개수 (특정 강아지가 받은)
//    @Query("SELECT COUNT(cm) FROM ChatMessage cm " +
//            "WHERE cm.friendRequest = :friendRequest " +
//            "AND cm.senderDog != :receiverDog " +
//            "AND cm.isRead = false")
//    long countUnreadMessages(@Param("friendRequest") FriendRequest friendRequest,
//                             @Param("receiverDog") Dog receiverDog);
//
//    // 특정 강아지가 받은 읽지 않은 메시지들
//    @Query("SELECT cm FROM ChatMessage cm " +
//            "WHERE cm.friendRequest = :friendRequest " +
//            "AND cm.senderDog != :receiverDog " +
//            "AND cm.isRead = false " +
//            "ORDER BY cm.sentAt ASC")
//    List<ChatMessage> findUnreadMessages(@Param("friendRequest") FriendRequest friendRequest,
//                                         @Param("receiverDog") Dog receiverDog);
//
//    // 메시지 읽음 처리
//    @Query("UPDATE ChatMessage cm SET cm.isRead = true " +
//            "WHERE cm.friendRequest = :friendRequest " +
//            "AND cm.senderDog != :receiverDog " +
//            "AND cm.isRead = false")
//    void markMessagesAsRead(@Param("friendRequest") FriendRequest friendRequest,
//                            @Param("receiverDog") Dog receiverDog);
//
//    // 특정 친구 관계의 마지막 메시지
//    @Query("SELECT cm FROM ChatMessage cm WHERE cm.friendRequest = :friendRequest " +
//            "ORDER BY cm.sentAt DESC LIMIT 1")
//    ChatMessage findLastMessage(@Param("friendRequest") FriendRequest friendRequest);
//}