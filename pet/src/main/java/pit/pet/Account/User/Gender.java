package pit.pet.Account.User;

public enum Gender {
    MALE("남성", "수컷"),
    FEMALE("여성", "암컷");

    private final String userLabel;
    private final String dogLabel;

    Gender(String userLabel, String dogLabel) {
        this.userLabel = userLabel;
        this.dogLabel = dogLabel;
    }

    public String getUserLabel() {
        return userLabel;
    }

    public String getDogLabel() {
        return dogLabel;
    }

    // 메서드명 수정 (대문자로 시작)
    public String Doglabel() {
        return dogLabel;
    }

    public static Gender fromUserLabel(String label) {
        for (Gender gender : Gender.values()) {
            if (gender.userLabel.equals(label) || gender.dogLabel.equals(label)) {
                return gender;
            }
        }
        throw new IllegalArgumentException("올바르지 않은 성별입니다: " + label);
    }

    // 검색을 위한 추가 메서드
    public static Gender fromSearchString(String searchStr) {
        if (searchStr == null || searchStr.trim().isEmpty()) {
            return null;
        }

        String normalized = searchStr.toLowerCase().trim();

        if (normalized.contains("수컷") || normalized.contains("남") || normalized.equals("male")) {
            return MALE;
        } else if (normalized.contains("암컷") || normalized.contains("여") || normalized.equals("female")) {
            return FEMALE;
        }

        return null;
    }
}