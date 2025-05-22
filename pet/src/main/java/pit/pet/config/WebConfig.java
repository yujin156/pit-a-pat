package pit.pet.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import java.io.File;
import java.nio.file.Paths;
import org.springframework.beans.factory.annotation.Value;
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload-dir}")
    private String uploadDir;  // ex) "./uploads"

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 1) 절대경로로 변환
        String absolutePath = Paths.get(uploadDir)
                .toAbsolutePath()
                .toString() + File.separator;

        // 2) "file:" + 절대경로 형태로 매핑
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + absolutePath);
    }
}