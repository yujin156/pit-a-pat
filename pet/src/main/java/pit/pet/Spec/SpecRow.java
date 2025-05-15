package pit.pet.Spec;


import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;

@XmlRootElement(name = "row")
public class SpecRow {
    private String spec;

    @XmlElement(name = "SPCS")
    public void setSpec(String spec) {

        this.spec = spec;
    }
    public String getSpec() {
        return spec;
    }
}
