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
}
