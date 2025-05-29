package pit.pet.Group.entity;

public enum Keyword {
    BREED("같은 종"),
    AREA("같은 동네"),
    TRAINING("훈련"),
    TRAVEL("여행");

    private final String keyLabel;

    Keyword(String keyLabel) {
        this.keyLabel = keyLabel;
    }

    public String getKeyLabel() {
        return keyLabel;
    }

    // 🔥 프론트에서 받은 interest 문자열로 매핑
    public static Keyword fromInterest(String interest) {
        if (interest == null) {
            throw new IllegalArgumentException("Interest가 null입니다.");
        }
        switch (interest.toLowerCase()) {
            case "breed":
                return BREED;
            case "area":
                return AREA;
            case "training":
                return TRAINING;
            case "travel":
                return TRAVEL;
            default:
                throw new IllegalArgumentException("알 수 없는 interest: " + interest);
        }
    }
}