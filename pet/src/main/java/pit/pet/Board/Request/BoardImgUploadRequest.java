package pit.pet.Board.Request;


import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class BoardImgUploadRequest {
    private Long bno;  // 이미지가 첨부될 게시글 번호
    private String biurl;
    private String bititle;
    private List<String> biUrlList;
    private LocalDateTime biuploadedat;
    private List<MultipartFile> imageFiles;  // 업로드할 이미지 파일
}
