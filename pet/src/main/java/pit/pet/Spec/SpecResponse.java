package pit.pet.Spec;


import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;

import java.util.List;

import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;
import java.util.List;

@XmlRootElement(name = "Grid_20210806000000000612_1")
public class SpecResponse {

    private List<Row> row;

    @XmlElement(name = "row")
    public List<Row> getRow() {
        return row;
    }

    public void setRow(List<Row> row) {
        this.row = row;
    }

    public static class Row {
        private String spcs;
        private String lvstckKnd;

        @XmlElement(name = "SPCS")
        public String getSpcs() {
            return spcs;
        }

        public void setSpcs(String spcs) {
            this.spcs = spcs;
        }

        @XmlElement(name = "LVSTCK_KND")
        public String getLvstckKnd() {
            return lvstckKnd;
        }

        public void setLvstckKnd(String lvstckKnd) {
            this.lvstckKnd = lvstckKnd;
        }
    }

}
