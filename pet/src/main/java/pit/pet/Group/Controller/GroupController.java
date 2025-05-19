package pit.pet.Group.Controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import pit.pet.Account.Repository.DogRepository;
import pit.pet.Account.User.Dog;
import pit.pet.Group.Request.ApplyGroupRequest;
import pit.pet.Group.Request.CreateGroupRequest;
import pit.pet.Group.Request.UpdateMemberStatusRequest;
import pit.pet.Group.Service.GroupMemberService;
import pit.pet.Group.Service.GroupService;

@Controller
@RequiredArgsConstructor
@RequestMapping("/groups")
public class GroupController {
    private final GroupService groupService;
    private final GroupMemberService groupMemberService;
    private final DogRepository dogRepository;

    /**
     * ✅ 그룹 생성 요청
     * - 그룹 이름 + 생성자 강아지 ID를 받아 그룹 생성
     */
    @PostMapping("/create")
    public ResponseEntity<?> createGroup(@RequestBody CreateGroupRequest request) {
        Dog dog = dogRepository.findById(request.getDogId())
                .orElseThrow(() -> new RuntimeException("해당 강아지를 찾을 수 없습니다."));
        groupService.createGroup(request.getGname(), dog);
        return ResponseEntity.ok("그룹 생성 완료");
    }

    /**
     * ✅ 그룹 가입 신청
     * - 그룹 번호와 강아지 ID를 받아 가입 대기 멤버로 등록
     */
    @PostMapping("/{gno}/apply")
    public ResponseEntity<?> applyGroup(@PathVariable Long gno,
                                        @RequestBody ApplyGroupRequest request) {
        Dog dog = dogRepository.findById(request.getDogId())
                .orElseThrow(() -> new RuntimeException("해당 강아지를 찾을 수 없습니다."));
        groupMemberService.applyMembership(gno, dog);
        return ResponseEntity.ok("가입 신청 완료");
    }

    /**
     * ✅ 가입 요청 승인/거부 (리더만 가능)
     * - 리더 gmno가 요청자의 값으로 넘어옴
     */
    @PostMapping("/{gno}/members/{gmno}/status")
    public ResponseEntity<?> updateMemberStatus(@PathVariable Long gno,
                                                @PathVariable Long gmno,
                                                @RequestBody UpdateMemberStatusRequest request) {
        groupMemberService.handleJoinRequest(gmno, request.getStatus(), request.getLeaderGmno());
        return ResponseEntity.ok("요청 처리 완료");
    }

    /**
     * ✅ 탈퇴 (본인만 가능)
     * - gmno는 URL에, 본인 확인용 requesterGmno는 쿼리 파라미터로 전달
     */
    @DeleteMapping("/members/{gmno}/withdraw")
    public ResponseEntity<?> withdraw(@PathVariable Long gmno,
                                      @RequestParam Long requesterGmno) {
        groupMemberService.withdraw(gmno, requesterGmno);
        return ResponseEntity.ok("탈퇴 완료");
    }
}
