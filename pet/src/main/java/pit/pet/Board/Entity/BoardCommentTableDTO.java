package pit.pet.Board.Entity;

import pit.pet.Account.Service.DogService;
import pit.pet.Account.User.Dog;       // Dog 엔티티 import
import pit.pet.Account.User.DogDTO;   // ✅ 수정된 DogDTO import

public class BoardCommentTableDTO {
    private Long bcno;
    private Long boardId;  // BoardTable의 ID만 필요
    private Long dogId;    // Dog의 ID만 필요
    private String bccomment;
    private String profileUrl;
    private DogDTO dog;


    // 생성자
    public BoardCommentTableDTO(BoardCommentTable comment, DogService dogService) {
        this.bcno = comment.getBcno();
        this.boardId = comment.getBoard().getBno(); // BoardTable의 ID
        this.dogId = comment.getDog().getDno();     // Dog의 ID
        this.bccomment = comment.getBccomment();
        this.profileUrl = dogService.getProfileImageUrl(comment.getDog().getDno()); // 프로필 이미지 URL

        if (comment.getDog() != null) {
            this.dog = new DogDTO(comment.getDog()); // Dog 엔티티로 DogDTO 생성 (dname 포함)
            this.profileUrl = dogService.getProfileImageUrl(comment.getDog().getDno()); // 기존 로직대로 profileUrl 설정
        } else {
            // Dog 정보가 없는 경우 (예: 탈퇴한 사용자 등) 대비
            this.dog = new DogDTO(null, "알 수 없음", null); // DogDTO 기본값 생성자 사용
            this.profileUrl = "/images/default-profile.png"; // 기본 프로필 URL
        }
    }

    // getters and setters
    public Long getBcno() { return bcno; }
    public void setBcno(Long bcno) { this.bcno = bcno; }
    public Long getBoardId() { return boardId; }
    public void setBoardId(Long boardId) { this.boardId = boardId; }
    public String getBccomment() { return bccomment; }
    public void setBccomment(String bccomment) { this.bccomment = bccomment; }
    public DogDTO getDog() { return dog; } // dog 필드 getter
    public void setDog(DogDTO dog) { this.dog = dog; } // dog 필드 setter
    public String getProfileUrl() { return profileUrl; } // profileUrl 필드 getter
    public void setProfileUrl(String profileUrl) { this.profileUrl = profileUrl; } // profileUrl 필드 setter
}
