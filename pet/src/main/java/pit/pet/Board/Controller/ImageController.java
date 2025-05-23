package pit.pet.Board.Controller;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Controller
@RequestMapping("/image")
public class ImageController {

    private static final String IMG_DIR = "C:/Users/user1/Desktop/pit-a-pat/pet/src/main/resources/static/img/";

    @GetMapping("/{filename:.+}")
    @ResponseBody
    public ResponseEntity<Resource> getImage(@PathVariable String filename) {
        try {
            Path imagePath = Paths.get(IMG_DIR + filename);
            if (!Files.exists(imagePath)) {
                return ResponseEntity.notFound().build();
            }

            Resource resource = new UrlResource(imagePath.toUri());

            // 확장자 기반 Content-Type 자동 설정
            String contentType = Files.probeContentType(imagePath);
            if (contentType == null) {
                contentType = "application/octet-stream"; // fallback
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(resource);

        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
