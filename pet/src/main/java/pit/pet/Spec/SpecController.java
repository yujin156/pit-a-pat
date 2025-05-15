package pit.pet.Spec;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/api")
@RequiredArgsConstructor
public class SpecController {

    private final SpecService animalService;
    private final SpecRepository specRepository;
    @GetMapping("/fetch")
    public String fetchBreeds() {
        try {
            animalService.fetchAndSaveBreeds();
            return "성공적으로 저장됨!";
        } catch (Exception e) {
            return "에러: " + e.getMessage();
        }
    }


    @GetMapping("/autocomplete")
    @ResponseBody
    public List<String> autocomplete(@RequestParam("keyword") String keyword) {
        return specRepository.findByNameContainingIgnoreCase(keyword)
                .stream()
                .map(Species::getName)
                .collect(Collectors.toList());
    }

    @GetMapping("/selectbreed")
    public String selectBreedPage() {
        return "Spec/Spec"; // templates/select-breed.html
    }
}
