package pit.pet.Account.User;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import pit.pet.Spec.Species;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Getter
@Setter
@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
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

    @Column(name = "status", columnDefinition = "VARCHAR(20) DEFAULT '온라인'")
    private String status = "온라인";

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonBackReference("user-dogs")
    private User owner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "species_id")
    @JsonIgnoreProperties({"dogs"})
    private Species species;

    @Enumerated(EnumType.STRING)
    @Column(name = "d_size", nullable = false)
    private DogSize size;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "dog_keyword1_mapping",
            joinColumns = @JoinColumn(name = "dog_id"),
            inverseJoinColumns = @JoinColumn(name = "keyword1_id")
    )
    @JsonIgnoreProperties({"dogs"})
    private List<DogKeyword1> keywords1 = new ArrayList<>();

    @OneToOne(mappedBy = "dog", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference("dog-image")
    private Dogimg image;
}