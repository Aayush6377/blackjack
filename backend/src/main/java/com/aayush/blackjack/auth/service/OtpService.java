package com.aayush.blackjack.auth.service;

import com.aayush.blackjack.auth.enums.OtpPurpose;
import com.aayush.blackjack.notification.dto.NotificationRequest;
import com.aayush.blackjack.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.util.HexFormat;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OtpService {
    private static final String OTP_CHARSET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
    private static final int OTP_LENGTH = 6;
    private static final int MAX_ATTEMPTS = 5;
    private static final Duration OTP_TTL = Duration.ofMinutes(10);
    private static final Duration COOLDOWN_TTL = Duration.ofSeconds(60);
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final StringRedisTemplate redisTemplate;
    private final NotificationService notificationService;

    public void generateAndSendOtp(String email, String name, OtpPurpose otpPurpose){
        String normalizedEmail = email.trim().toLowerCase();
        String coolDownKey = otpPurpose.getRedisPrefix() + "cooldown:" + normalizedEmail;

        if (redisTemplate.hasKey(coolDownKey)){
            Long remainingSeconds = redisTemplate.getExpire(coolDownKey);
            throw new IllegalStateException(
                    "Please wait " + (remainingSeconds != null && remainingSeconds > 0 ? remainingSeconds : 60)
                    + " seconds before requesting another code."
            );
        }

        String rawCode = generateAlphanumericCode();
        String codeHash = hashCode(rawCode);

        String codeKey = otpPurpose.getRedisPrefix() + "code:" + normalizedEmail;
        String attemptsKey = otpPurpose.getRedisPrefix() + "attempts:" + normalizedEmail;

        redisTemplate.opsForValue().set(codeKey, codeHash, OTP_TTL);
        redisTemplate.opsForValue().set(attemptsKey, "0", OTP_TTL);
        redisTemplate.opsForValue().set(coolDownKey, "1", COOLDOWN_TTL);

        notificationService.sendNotification(NotificationRequest.builder()
                .recipient(normalizedEmail)
                .template(otpPurpose.getTemplate())
                .variables(
                        Map.of(
                                "name", name != null && !name.isBlank() ? name : "Player",
                                "otpCode", rawCode,
                                "expiryMinutes", OTP_TTL.toMinutes()
                        )
                )
                .build()
        );
    }

    public void verifyOtp(String email, String rawCode, OtpPurpose purpose){
        String normalizedEmail = email.trim().toLowerCase();
        String codeKey = purpose.getRedisPrefix() + "code:" + normalizedEmail;
        String attemptsKey = purpose.getRedisPrefix() + "attempts:" + normalizedEmail;

        String storedHash = redisTemplate.opsForValue().get(codeKey);
        if (storedHash == null) {
            throw new IllegalArgumentException("Verification code has expired or does not exist.");
        }

        Long attempts = redisTemplate.opsForValue().increment(attemptsKey);
        if (attempts != null && attempts > MAX_ATTEMPTS) {
            clearOtpKeys(normalizedEmail, purpose);
            throw new IllegalStateException("Too many invalid attempts. Please request a new code.");
        }

        String incomingHash = hashCode(rawCode.trim().toUpperCase());
        if (!MessageDigest.isEqual(
                storedHash.getBytes(StandardCharsets.UTF_8),
                incomingHash.getBytes(StandardCharsets.UTF_8)
        )) {
            throw new IllegalArgumentException("Invalid verification code.");
        }

        clearOtpKeys(normalizedEmail, purpose);
    }

    private void clearOtpKeys(String normalizedEmail, OtpPurpose purpose) {
        redisTemplate.delete(purpose.getRedisPrefix() + "code:" + normalizedEmail);
        redisTemplate.delete(purpose.getRedisPrefix() + "attempts:" + normalizedEmail);
        redisTemplate.delete(purpose.getRedisPrefix() + "cooldown:" + normalizedEmail);
    }

    private String generateAlphanumericCode() {
        StringBuilder sb = new StringBuilder(OTP_LENGTH);
        for (int i = 0; i < OTP_LENGTH; i++) {
            int idx = SECURE_RANDOM.nextInt(OTP_CHARSET.length());
            sb.append(OTP_CHARSET.charAt(idx));
        }
        return sb.toString();
    }

    private String hashCode(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
