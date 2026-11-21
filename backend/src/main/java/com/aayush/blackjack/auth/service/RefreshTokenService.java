package com.aayush.blackjack.auth.service;

import com.aayush.blackjack.auth.entity.RefreshToken;
import com.aayush.blackjack.auth.repository.RefreshTokenRepository;
import com.aayush.blackjack.user.entity.User;
import com.aayush.blackjack.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.HexFormat;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;

    @Value("${app.jwt.refresh-expiration-days:7}")
    private long refreshExpirationDays;

    @Transactional
    public String createRefreshToken(User user){
        String rawToken = generateRawToken();
        String tokenHash = hashToken(rawToken);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setTokenHash(tokenHash);
        refreshToken.setExpiryDate(Instant.now().plus(refreshExpirationDays, ChronoUnit.DAYS));
        refreshToken.setRevoked(false);

        refreshTokenRepository.save(refreshToken);
        return rawToken;
    }

    public record RotatedTokenResult(User user, String newRawRefreshToken) {}

    @Transactional
    public RotatedTokenResult rotateRefreshToken(String rawToken) {
        if (rawToken == null || rawToken.isBlank()){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Refresh token is missing");
        }

        String tokenHash = hashToken(rawToken);
        RefreshToken existingToken = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid refresh token"));

        User user = existingToken.getUser();

        if (existingToken.getRevoked()) {
            revokeAllUserTokens(user);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Refresh token reuse detected. All sessions revoked.");
        }

        if (existingToken.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.deleteByIdReturningCount(existingToken.getId());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Refresh token has expired");
        }

        if (!user.getEnabled()) {
            throw new IllegalStateException("User account is disabled");
        }

        int deleted = refreshTokenRepository.deleteByIdReturningCount(existingToken.getId());
        if (deleted == 0) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token already rotated");
        }

        String newRawToken = createRefreshToken(user);
        return new RotatedTokenResult(user, newRawToken);
    }

    @Transactional
    public void revokeToken(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            return;
        }
        String tokenHash = hashToken(rawToken);
        refreshTokenRepository.deleteByTokenHash(tokenHash);
    }

    @Transactional
    public void revokeAllUserTokens(User user) {
        refreshTokenRepository.deleteAllByUser(user);

        user.setTokenVersion(user.getTokenVersion() + 1);
        userRepository.save(user);
    }

    private String generateRawToken() {
        byte[] bytes = new byte[48];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm not available", e);
        }
    }
}
