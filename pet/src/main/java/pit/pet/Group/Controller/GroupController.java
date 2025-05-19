package pit.pet.Group.Controller;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import pit.pet.Group.Request.GruopRequest;
import pit.pet.Group.Service.GroupService;

@Controller
@RequiredArgsConstructor
@RequestMapping("/group")
public class GroupController {
    private final GroupService groupService;

    @GetMapping("/create")
    public String showCreateGroupForm(Model model) {
        model.addAttribute("groupRequest", new GruopRequest());
        return "group/create";
    }

    @PostMapping("/create")
    public String createGroup(@ModelAttribute GruopRequest gruopRequest){
        groupService.createGroup(gruopRequest);
        return "redirect:/group/list";
    }
}
