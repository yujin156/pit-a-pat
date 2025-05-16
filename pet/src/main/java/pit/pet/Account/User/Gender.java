package pit.pet.Account.User;

public enum Gender {
    MALE("남성", "수컷"),
    FEMALE("여성", "암컷");

    private final String Userlabel;
    private final String Doglabel;

    Gender(String Userlabel,String Doglabel) {
        this.Userlabel = Userlabel;
        this.Doglabel = Doglabel;
    }

    public String Userlabel() {
        return Userlabel;
    }

    public String Doglabel() {
        return Doglabel;
    }
    public static Gender fromUserLabel(String label) {
        for (Gender gender : Gender.values()) {
            if (gender.Userlabel.equals(label)) {
                return gender;
            }
        }
        throw new IllegalArgumentException("올바르지 않은 성별입니다: " + label);
    }

}
