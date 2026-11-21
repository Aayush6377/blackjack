package com.aayush.blackjack.security.oauth2;

import com.aayush.blackjack.auth.enums.AuthProvider;
import com.aayush.blackjack.security.UserPrincipal;
import com.aayush.blackjack.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.Nullable;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class CustomOidcUserService implements OAuth2UserService<OidcUserRequest, OidcUser> {

    private final UserProvisioningService userProvisioningService;
    private final OidcUserService oidcUserService = new OidcUserService();

    @Override
    public @Nullable OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        OidcUser oidcUser = oidcUserService.loadUser(userRequest);

        String providerUserId = oidcUser.getSubject();
        String email = oidcUser.getEmail();

        if (email == null || email.isBlank() || Boolean.FALSE.equals(oidcUser.getEmailVerified())) {
            throw new OAuth2AuthenticationException(new OAuth2Error("email_not_verified"), "Google account must have a verified email address.");
        }

        String name = oidcUser.getFullName();

        if (name == null || name.isBlank()) {
            name = "Blackjack Player";
        }

        String picture = oidcUser.getPicture();

        User user = userProvisioningService.processOAuthUser(
                AuthProvider.GOOGLE,
                providerUserId,
                email,
                name,
                picture
        );

        return UserPrincipal.create(user, oidcUser);
    }
}
