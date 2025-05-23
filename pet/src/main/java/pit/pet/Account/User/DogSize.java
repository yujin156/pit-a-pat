package pit.pet.Account.User;

public enum DogSize {
    SMALL("소형견"),
    MEDIUM("중형견"),
    LARGE("대형견");

    private final String label;

    DogSize(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    @Override
    public String toString() {
        return this.name(); // DB에 저장될 값
    }
}