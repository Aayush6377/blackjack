package com.aayush.blackjack.security.oauth2;

import com.aayush.blackjack.auth.enums.AuthProvider;
import com.aayush.blackjack.security.UserPrincipal;
import com.aayush.blackjack.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserProvisioningService userProvisioningService;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        AuthProvider provider;
        switch (registrationId){
            case "github" -> provider = AuthProvider.GITHUB;
            case "google" -> provider = AuthProvider.GOOGLE;
            default -> throw new OAuth2AuthenticationException(new OAuth2Error("unsupported_provider"), "Provider not registered: " + registrationId);
        }

        Map<String, Object> attributes = oAuth2User.getAttributes();

        String providerUserId = userProvisioningService.extractProviderUserId(provider, attributes);
        String email = userProvisioningService.extractEmail(provider, attributes, userRequest.getAccessToken().getTokenValue());
        String name = userProvisioningService.extractName(provider, attributes);
        String avatarUrl = userProvisioningService.extractAvatarUrl(provider, attributes);

        if (email == null || email.isBlank()) {
            throw new OAuth2AuthenticationException(new OAuth2Error("email_not_found"), "Email not available from " + provider + " account.");
        }

        User user = userProvisioningService.processOAuthUser(provider, providerUserId, email, name, avatarUrl);
        return UserPrincipal.create(user, attributes);
    }
}
