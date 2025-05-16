package pit.pet.Account.Service;


import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pit.pet.Account.Repository.DogRepository;
import pit.pet.Account.Repository.DogimgRepository;
import pit.pet.Account.User.Dog;
import pit.pet.Account.Request.DogregiRequest;
import pit.pet.Account.User.Gender;


@Service
@RequiredArgsConstructor
public class DogregiService {
    private final DogRepository dogRepository;
    private final DogimgRepository dogimgRepository;

    @Transactional
    public Dog registerDog(DogregiRequest request) {
        Dog dog = new Dog();

        dog.setD_name(request.getDname());
        dog.setD_Bday(request.getDBday());
        dog.setU_gender(Gender.valueOf(request.getDGender()));
        dog.setD_intro(request.getDGender());

        return dogRepository.save(dog);
    }
}
