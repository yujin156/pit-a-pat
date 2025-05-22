package pit.pet.Account.User;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import pit.pet.Spec.Species;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Getter
@Setter
@Entity
public class Dog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long dno;

    @Column(name = "d_name", nullable = false)
    private String dname;

    @Enumerated(EnumType.STRING)
    @Column(name = "u_gender", nullable = false)
    private Gender ugender;

    @Column(name = "d_Bday", nullable = false)
    private Date dBday;

    @Column(name = "d_intro", nullable = false)
    private String dintro;

    @ManyToOne
    private User owner;

    // ✅ 종 연결 (1개만 선택 가능)
    @ManyToOne
    @JoinColumn(name = "species_id")
    private Species species;

    @Enumerated(EnumType.STRING)
    @Column(name = "d_size", nullable = false)
    private DogSize size;

    // ✅ 키워드 연결 (다대다)
    @ManyToMany
    @JoinTable(
            name = "dog_keyword1_mapping",
            joinColumns = @JoinColumn(name = "dog_id"),
            inverseJoinColumns = @JoinColumn(name = "keyword1_id")
    )
    private List<DogKeyword1> keywords1 = new ArrayList<>();

    @ManyToMany
    @JoinTable(
            name = "dog_keyword2_mapping",
            joinColumns = @JoinColumn(name = "dog_id"),
            inverseJoinColumns = @JoinColumn(name = "keyword2_id")
    )
    private List<DogKeyword2> keywords2 = new ArrayList<>();
}
