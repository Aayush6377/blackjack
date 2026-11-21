
package com.aayush.blackjack.security;

import com.aayush.blackjack.user.entity.User;
import lombok.Getter;
import org.jspecify.annotations.Nullable;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.OidcUserInfo;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.*;

@Getter
public class UserPrincipal implements UserDetails, OAuth2User, OidcUser {

    private final UUID id;
    private final String email;
    private final String password;
    private final Integer tokenVersion;
    private final boolean enabled;
    private final Collection<? extends GrantedAuthority> authorities;
    private final Map<String, Object> attributes;
    private final OidcUser oidcUser;

    public UserPrincipal(User user) {
        this(user, Collections.emptyMap(), null);
    }

    private UserPrincipal(
            User user,
            Map<String, Object> attributes,
            @Nullable OidcUser oidcUser
    ) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.password = user.getPasswordHash();
        this.tokenVersion = user.getTokenVersion();
        this.enabled = Boolean.TRUE.equals(user.getEnabled());

        this.authorities = List.of(
                new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
        );

        this.attributes = attributes;
        this.oidcUser = oidcUser;
    }

    public static UserPrincipal create(User user, Map<String, Object> attributes) {
        return new UserPrincipal(user, attributes, null);
    }

    public static UserPrincipal create(User user, OidcUser oidcUser) {
        return new UserPrincipal(
                user,
                oidcUser.getAttributes(),
                oidcUser
        );
    }

    // oauth

    @Override
    public String getName() {
        return id.toString();
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    @Override
    public Map<String, Object> getClaims() {
        return oidcUser != null
                ? oidcUser.getClaims()
                : Collections.emptyMap();
    }

    @Override
    public @Nullable OidcUserInfo getUserInfo() {
        return oidcUser != null
                ? oidcUser.getUserInfo()
                : null;
    }

    @Override
    public @Nullable OidcIdToken getIdToken() {
        return oidcUser != null
                ? oidcUser.getIdToken()
                : null;
    }

    // UserDetails

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return enabled;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }
}
