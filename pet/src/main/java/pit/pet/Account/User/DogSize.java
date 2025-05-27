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

    public double[] recommendLengthRange() {
        return switch (this) {
            case SMALL  -> new double[]{0.0, 3.0};
            case MEDIUM -> new double[]{3.0, 6.0};
            case LARGE  -> new double[]{6.0, 10.0};
        };
    }
    @Override
    public String toString() {
        return this.name(); // DB에 저장될 값
    }
}