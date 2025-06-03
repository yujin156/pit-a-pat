package pit.pet.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import java.io.File;
import java.nio.file.Paths;
import org.springframework.beans.factory.annotation.Value;

@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {
    private final CompleteUserCheckInterceptor completeUserCheckInterceptor;
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

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        System.out.println("✅ CompleteUserCheckInterceptor 등록!");
        registry.addInterceptor(completeUserCheckInterceptor)
                .addPathPatterns(
                        "/mypage/**",
                        "/user/**",
                        "/api/**",
                        "/",            // 메인(홈)
                        "/home",        // 홈 페이지가 /home이면
                        "/login"
                )
                .excludePathPatterns(
                        "/user/missing-info", "/register/**", "/oauth2/**",
                        "/login", "/css/**", "/js/**", "/img/**","/api/**"
                );
    }
}