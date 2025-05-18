package pit.pet.chat.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pit.pet.chat.model.MatchingChat;

import java.util.List;

@Repository
public interface MatchingChatRepository extends JpaRepository<MatchingChat, Long> {
    // 특정 두 유저 사이의 채팅 메시지 조회
    @Query("SELECT mc FROM MatchingChat mc " +
            "WHERE (mc.senderDId.dno = :dog1Id AND mc.receiverDId.dno = :dog2Id) " +
            "OR (mc.senderDId.dno = :dog2Id AND mc.receiverDId.dno = :dog1Id) " +
            "ORDER BY mc.mNowdate ASC")
    List<MatchingChat> findChatHistory(
            @Param("dog1Id") Long dog1Id,
            @Param("dog2Id") Long dog2Id
    );

    // 특정 강아지가 발신자인 메시지 조회
    List<MatchingChat> findBySenderDIdDno(int dogId);

    // 특정 강아지가 수신자인 메시지 조회
    List<MatchingChat> findByReceiverDIdDno(int dogId);
}