package pit.pet.Group.entity;


import lombok.Getter;
import lombok.Setter;
import pit.pet.Account.User.Dog;

@Getter
@Setter
public class GroupMemberTableDto {
    private Long gmno;
    private Long gno;
    private String gname;
    private String gcontent;
    private String gimg;
    private String memberStatus;
    private Boolean isLeader;
    // 🔥 추가: 강아지 이름, 이미지 URL
    private String dogName;
    private String dogImgUrl;

    public GroupMemberTableDto(GroupMemberTable gm) {
        this.gmno = gm.getGmno();
        this.gno = gm.getGroupTable().getGno();
        this.gname = gm.getGroupTable().getGname();
        this.gcontent = gm.getGroupTable().getGcontent();
        this.gimg = gm.getGroupTable().getGimg();
        this.memberStatus = gm.getState().name();
        this.isLeader = false;
        // === 강아지 정보 추가 ===
        Dog dog = gm.getDog();
        if (dog != null) {
            this.dogName = dog.getDname();
            if (dog.getImage() != null && dog.getImage().getDiurl() != null) {
                this.dogImgUrl = dog.getImage().getDiurl();
            } else {
                this.dogImgUrl = "/images/default_dog_profile.png";
            }
        } else {
            this.dogName = "이름없음";
            this.dogImgUrl = "/images/default_dog_profile.png";
        }
    }
}
