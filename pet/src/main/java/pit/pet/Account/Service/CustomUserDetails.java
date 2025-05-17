package pit.pet.Account.Service;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import pit.pet.Account.User.User;

import java.util.Collection;
import java.util.Collections;
import java.util.List;

public class CustomUserDetails implements UserDetails {

    private final User user;

    public CustomUserDetails(User user) {
        this.user = user;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Role이 있다면 권한 처리 추가 가능
        if (user.getRole() != null) {
            return List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
        }
        return Collections.emptyList();
    }

    @Override
    public String getPassword() {
        return user.getUpwd();
    }

    public String getUname() {
        return user.getUname();
    }


    @Override
    public String getUsername() {
        return user.getUemail();
    }

    @Override
    public boolean isAccountNonExpired() { return true; }
    @Override
    public boolean isAccountNonLocked() { return true; }
    @Override
    public boolean isCredentialsNonExpired() { return true; }
    @Override
    public boolean isEnabled() { return true; }
}
