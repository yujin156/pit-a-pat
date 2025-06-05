package pit.pet.Board.Request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BoardCommentCreateRequest {
    private Long bno;      // 게시글 번호
    private Long dno;      // 프로필(개) 번호
    private String content;
    private Long gno;

    // Getters and Setters
    public Long getBno() {
        return bno;
    }

    public void setBno(Long bno) {
        this.bno = bno;
    }

    public Long getDno() {
        return dno;
    }

    public void setDno(Long dno) {
        this.dno = dno;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Long getGno() {
        return gno;
    }

    public void setGno(Long gno) {
        this.gno = gno;
    }
}
