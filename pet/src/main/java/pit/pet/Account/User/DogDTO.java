package pit.pet.Account.User;

public class DogDTO {
    private Long dno;
    private String dname;
    private String speciesName; // species name을 포함할 수 있습니다 (필요시)

    // 생성자
    public DogDTO(Dog dog) {
        this.dno = dog.getDno();
        this.dname = dog.getDname();
        this.speciesName = dog.getSpecies() != null ? dog.getSpecies().getName() : null;
    }

    public DogDTO(Long dno, String dname, String speciesName) {
        this.dno = dno;
        this.dname = dname;
        this.speciesName = speciesName;
    }

    // getters and setters
    public Long getDno() {
        return dno;
    }

    public void setDno(Long dno) {
        this.dno = dno;
    }

    public String getDname() {
        return dname;
    }

    public void setDname(String dname) {
        this.dname = dname;
    }

    public String getSpeciesName() {
        return speciesName;
    }

    public void setSpeciesName(String speciesName) {
        this.speciesName = speciesName;
    }
}