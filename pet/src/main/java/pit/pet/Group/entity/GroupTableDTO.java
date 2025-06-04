package pit.pet.Group.entity;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GroupTableDTO {
    private Long gno;
    private String gname;
    private String ginfo;
    private String interest;
    private Integer gmembercount;
    private Long gleader;
    private String gcontent;
    private String gimg;
    private Keyword gkeyword;

    // 강아지 정보 추가
    private String dogName;  // 강아지 이름
    private String dogProfileImageUrl;  // 강아지 프로필 이미지 URL

    // 기존 생성자
    public GroupTableDTO(Long gno, String gname, String ginfo, String interest, Integer gmembercount, Long gleader, String gcontent, String gimg, Keyword gkeyword) {
        this.gno = gno;
        this.gname = gname;
        this.ginfo = ginfo;
        this.interest = interest;
        this.gmembercount = gmembercount;
        this.gleader = gleader;
        this.gcontent = gcontent;
        this.gimg = gimg;
        this.gkeyword = gkeyword;
    }

    // setter 메서드 추가
    public void setDogName(String dogName) {
        this.dogName = dogName;
    }

    public void setDogProfileImageUrl(String dogProfileImageUrl) {
        this.dogProfileImageUrl = dogProfileImageUrl;
    }

    // getter 메서드도 추가해야 할 수도 있음
    public String getDogName() {
        return dogName;
    }

    public String getDogProfileImageUrl() {
        return dogProfileImageUrl;
    }
}
