package pit.pet.Api;

public class RegionCodeResult {
    private final String sidoCode;
    private final String sigunguCode;
    private final String emdCode;

    public RegionCodeResult(String sidoCode, String sigunguCode, String emdCode) {
        this.sidoCode = sidoCode;
        this.sigunguCode = sigunguCode;
        this.emdCode = emdCode;
    }

    public String getSidoCode() { return sidoCode; }
    public String getSigunguCode() { return sigunguCode; }
    public String getEmdCode() { return emdCode; }
}