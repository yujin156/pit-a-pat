package pit.pet.Security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import pit.pet.Account.Service.CustomUserDetailsService;
import pit.pet.Security.JWT.JwtTokenFilter;
import pit.pet.config.OAuth2LoginSuccessHandler;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomUserDetailsService customUserDetailsService;
    private final JwtTokenFilter jwtTokenFilter;
    private final OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;
    @Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
        // AuthenticationManagerBuilder 꺼내기
        AuthenticationManagerBuilder authBuilder =
                http.getSharedObject(AuthenticationManagerBuilder.class);

        // UserDetailsService, PasswordEncoder 설정
        authBuilder
                .userDetailsService(customUserDetailsService)
                .passwordEncoder(bCryptPasswordEncoder());

        // 그리고 바로 build()
        return authBuilder.build();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .headers(headers -> headers.frameOptions(frameOptions -> frameOptions.disable()))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(authz -> authz.anyRequest().permitAll())
                .oauth2Login(oauth2 -> oauth2
                        .loginPage("/login") // 또는 default
                        .successHandler(oAuth2LoginSuccessHandler)

                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED) // 세션 유지 허용
                )
                .addFilterBefore(jwtTokenFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
