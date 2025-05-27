package pit.pet.trail;


import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/map")
@RequiredArgsConstructor
public class MapController {
    private final TrailRepository trailRepository;

    @GetMapping("/{id}")
    public String viewTrail(@PathVariable Long id, Model model) {
        Trail trail = trailRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Trail not found"));
        model.addAttribute("trail", trail);
        return "trails/map"; // templates/trail/map.html 을 반환
    }


}
