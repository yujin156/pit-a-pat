package pit.pet.Account.User;

public class DogDTO {
    private Long dno;
    private String dname;
    private String speciesName;
    private String avatarUrl;
    private boolean isMain; // 대표 프로필 여부 (Dog 엔티티에 해당 필드/메서드가 있다고 가정)
    private String size;    // DogSize Enum의 getLabel() 값을 저장할 필드
    private String gender;  // Gender Enum의 getDogLabel() 값을 저장할 필드

    // 생성자
    public DogDTO(Dog dog) { // Dog 엔티티 객체를 받는다고 가정
        this.dno = dog.getDno();
        this.dname = dog.getDname();
        this.speciesName = dog.getSpecies() != null ? dog.getSpecies().getName() : "정보 없음";

        if (dog.getImage() != null && dog.getImage().getDiurl() != null) {
            this.avatarUrl = dog.getImage().getDiurl();
        } else {
            this.avatarUrl = "/groups/images/default_avatar.jpg"; // 기본 이미지 경로
        }

        // Gender Enum의 getDogLabel() 사용
        if (dog.getUgender() != null) { // dog.getGender()가 Gender Enum 객체를 반환한다고 가정
            this.gender = dog.getUgender().getDogLabel(); // "수컷" 또는 "암컷"
        } else {
            this.gender = "성별 정보 없음";
        }

        // DogSize Enum의 getLabel() 사용
        if (dog.getSize() != null) { // dog.getSize()가 DogSize Enum 객체를 반환한다고 가정
            this.size = dog.getSize().getLabel(); // "소형견", "중형견", "대형견"
        } else {
            this.size = "크기 정보 없음";
        }
    }

    // 다른 생성자 (필요하다면 isMain, size, gender도 초기화 고려)
    public DogDTO(Long dno, String dname, String speciesName) {
        // ... (기존 코드) ...
        this.isMain = false; // 기본값
        this.size = "크기 정보 없음"; // 기본값
        this.gender = "성별 정보 없음"; // 기본값
    }

    // Getters and Setters (isMain, size, gender 포함)
    public Long getDno() { return dno; }
    public void setDno(Long dno) { this.dno = dno; }

    public String getDname() { return dname; }
    public void setDname(String dname) { this.dname = dname; }

    public String getSpeciesName() { return speciesName; }
    public void setSpeciesName(String speciesName) { this.speciesName = speciesName; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public boolean isMain() { return isMain; }
    public void setMain(boolean main) { isMain = main; }

    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
}