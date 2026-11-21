package com.aayush.blackjack.security.service;

import com.aayush.blackjack.security.UserPrincipal;
import com.aayush.blackjack.user.entity.User;
import com.aayush.blackjack.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CurrentUserService {
    private final UserRepository userRepository;

    public UserPrincipal getCurrentUserPrincipal(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            throw new AuthenticationCredentialsNotFoundException("No authenticated user found in security context");
        }

        return principal;
    }

    public UUID getCurrentUserId(){
        return getCurrentUserPrincipal().getId();
    }

    @Transactional(readOnly = true)
    public User getCurrentUser(){
        UUID userId = getCurrentUserId();
        return userRepository.findById(userId).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Authenticated user not found in database"));
    }

    public Optional<UUID> getCurrentUserIdOptional() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null
                && authentication.isAuthenticated()
                && authentication.getPrincipal() instanceof UserPrincipal principal) {
            return Optional.of(principal.getId());
        }
        return Optional.empty();
    }
}
