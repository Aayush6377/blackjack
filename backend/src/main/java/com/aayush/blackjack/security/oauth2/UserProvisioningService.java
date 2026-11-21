package com.aayush.blackjack.security.oauth2;

import com.aayush.blackjack.auth.entity.OAuthAccount;
import com.aayush.blackjack.auth.enums.AuthProvider;
import com.aayush.blackjack.auth.repository.OAuthAccountRepository;
import com.aayush.blackjack.notification.dto.NotificationRequest;
import com.aayush.blackjack.notification.enums.NotificationTemplate;
import com.aayush.blackjack.notification.service.NotificationService;
import com.aayush.blackjack.user.entity.User;
import com.aayush.blackjack.user.enums.Role;
import com.aayush.blackjack.user.repository.UserRepository;
import com.aayush.blackjack.wallet.entity.ChipWallet;
import com.aayush.blackjack.wallet.repository.ChipWalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserProvisioningService {

    private final UserRepository userRepository;
    private final OAuthAccountRepository oAuthAccountRepository;
    private final ChipWalletRepository chipWalletRepository;
    private final NotificationService notificationService;

    @Transactional
    User processOAuthUser(
            AuthProvider provider,
            String providerUserId,
            String email,
            String name,
            String avatarUrl
    ) {
        Optional<OAuthAccount> oAuthAccount = oAuthAccountRepository.findByProviderAndProviderUserId(provider, providerUserId);

        if (oAuthAccount.isPresent()){
            return oAuthAccount.get().getUser();
        }

        User user = userRepository.findByEmailIgnoreCase(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setName(name);
            newUser.setEmail(email);
            newUser.setProfileImageUrl(avatarUrl);
            newUser.setRole(Role.USER);
            newUser.setEmailVerified(true);
            newUser.setEnabled(true);

            User saved = userRepository.save(newUser);

            ChipWallet chipWallet = new ChipWallet();
            chipWallet.setUser(newUser);

            chipWalletRepository.save(chipWallet);

            notificationService.sendNotification(NotificationRequest.builder()
                    .recipient(newUser.getEmail())
                    .template(NotificationTemplate.WELCOME)
                    .variables(
                            Map.of(
                                    "name", newUser.getName(),
                                    "startingChips", 1000L
                            )
                    )
                    .build()
            );

            return saved;
        });

        if (user.getProfileImageUrl() == null && avatarUrl != null){
            user.setProfileImageUrl(avatarUrl);
            userRepository.save(user);
        }

        OAuthAccount newOAuthAccount = new OAuthAccount();
        newOAuthAccount.setEmail(email);
        newOAuthAccount.setUser(user);
        newOAuthAccount.setProvider(provider);
        newOAuthAccount.setProviderUserId(providerUserId);

        oAuthAccountRepository.save(newOAuthAccount);

        return user;
    }

    String extractProviderUserId(AuthProvider provider, Map<String, Object> attrs) {
        return switch (provider) {
            case GOOGLE -> String.valueOf(attrs.get("sub"));
            case GITHUB -> String.valueOf(attrs.get("id"));
            default -> throw new IllegalStateException("No provider found");
        };
    }

    String extractName(AuthProvider provider, Map<String, Object> attrs) {
        Object name = attrs.get("name");
        if (name != null && !name.toString().isBlank()) {
            return name.toString();
        }
        return provider == AuthProvider.GITHUB ? String.valueOf(attrs.get("login")) : "Blackjack Player";
    }

    String extractAvatarUrl(AuthProvider provider, Map<String, Object> attrs) {
        return switch (provider) {
            case GOOGLE -> (String) attrs.get("picture");
            case GITHUB -> (String) attrs.get("avatar_url");
            default -> throw new IllegalStateException("No provider found");
        };
    }

    String extractEmail(AuthProvider provider, Map<String, Object> attrs, String accessToken) {
        Object email = attrs.get("email");
        if (email != null && !email.toString().isBlank()) {
            return email.toString();
        }
        if (provider == AuthProvider.GITHUB) {
            return fetchPrimaryGitHubEmail(accessToken);
        }
        return null;
    }

    private record GitHubEmail(
            String email,
            boolean primary,
            boolean verified,
            String visibility
    ) {}

    private String fetchPrimaryGitHubEmail(String accessToken) {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<List<GitHubEmail>> response = restTemplate.exchange(
                "https://api.github.com/user/emails",
                HttpMethod.GET,
                entity,
                new ParameterizedTypeReference<>() {}
        );

        if (response.getBody() == null) {
            return null;
        }

        return response.getBody().stream()
                .filter(GitHubEmail::primary)
                .filter(GitHubEmail::verified)
                .map(GitHubEmail::email)
                .findFirst()
                .orElse(null);
    }
}
