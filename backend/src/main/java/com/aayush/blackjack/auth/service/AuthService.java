package com.aayush.blackjack.auth.service;

import com.aayush.blackjack.auth.dto.*;
import com.aayush.blackjack.auth.enums.OtpPurpose;
import com.aayush.blackjack.notification.dto.NotificationRequest;
import com.aayush.blackjack.notification.enums.NotificationTemplate;
import com.aayush.blackjack.notification.service.NotificationService;
import com.aayush.blackjack.security.UserPrincipal;
import com.aayush.blackjack.security.jwt.JwtService;
import com.aayush.blackjack.user.entity.User;
import com.aayush.blackjack.user.enums.Role;
import com.aayush.blackjack.user.repository.UserRepository;
import com.aayush.blackjack.wallet.entity.ChipWallet;
import com.aayush.blackjack.wallet.repository.ChipWalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final ChipWalletRepository chipWalletRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final OtpService otpService;
    private final NotificationService notificationService;

    @Transactional
    public void register(RegisterRequest request){
        String normalizeEmail = request.email().trim().toLowerCase();

        User user = userRepository.findByEmailIgnoreCase(normalizeEmail).map(existingUser -> {
            if (existingUser.getEmailVerified()){
                throw new IllegalArgumentException("An account with this email already exists.");
            }

            existingUser.setName(request.name());
            existingUser.setPasswordHash(passwordEncoder.encode(request.password()));
            return userRepository.save(existingUser);

        }).orElseGet(() -> {
            User newUser = new User();
            newUser.setName(request.name());
            newUser.setEmail(normalizeEmail);
            newUser.setPasswordHash(passwordEncoder.encode(request.password()));
            newUser.setRole(Role.USER);
            newUser.setEmailVerified(false);
            newUser.setEnabled(true);

            return userRepository.save(newUser);
        });

        otpService.generateAndSendOtp(user.getEmail(), user.getName(), OtpPurpose.EMAIL_VERIFICATION);
    }

    @Transactional(readOnly = true)
    public void resendVerificationOtp(SendOtpRequest request){
        String normalizedEmail = request.email().trim().toLowerCase();
        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException("No account found with this email."));

        if (user.getEmailVerified()){
            throw new IllegalStateException("Email is already verified. Please log in.");
        }

        otpService.generateAndSendOtp(user.getEmail(), user.getName(), OtpPurpose.EMAIL_VERIFICATION);
    }

    @Transactional
    public AuthResponse verifyEmailOtp(VerifyOtpRequest request){
        String normalizedEmail = request.email().trim().toLowerCase();
        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException("No account found with this email."));

        otpService.verifyOtp(user.getEmail(), request.code(), OtpPurpose.EMAIL_VERIFICATION);

        if (!user.getEmailVerified()){
            user.setEmailVerified(true);
            user = userRepository.save(user);

            if (!chipWalletRepository.existsByUser(user)){
                ChipWallet chipWallet = new ChipWallet();
                chipWallet.setUser(user);
                chipWallet.setBalance(1000L);
                chipWalletRepository.save(chipWallet);
            }

            notificationService.sendNotification(NotificationRequest.builder()
                    .recipient(user.getEmail())
                    .template(NotificationTemplate.WELCOME)
                    .variables(
                            Map.of(
                                    "name", user.getName(),
                                    "startingChips", 1000L
                            )
                    )
                    .build()
            );
        }

        return issueTokensForUser(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!user.getEnabled()) {
            throw new IllegalStateException("Your account has been suspended.");
        }

        if (!user.getEmailVerified()) {
            throw new IllegalStateException("Please verify your email address before logging in.");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(normalizedEmail, request.password())
        );

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User authenticatedUser = userRepository.findById(principal.getId()).orElseThrow();

        return issueTokensForUser(authenticatedUser);
    }

    @Transactional
    public void logout(String bearerToken, String rawRefreshToken) {
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            jwtService.blacklistToken(bearerToken.substring(7));
        }
        refreshTokenService.revokeToken(rawRefreshToken);
    }

    @Transactional
    public AuthResponse refreshTokens(String rawRefreshToken) {
        RefreshTokenService.RotatedTokenResult rotated = refreshTokenService.rotateRefreshToken(rawRefreshToken);

        User user = rotated.user();
        String newAccessToken = jwtService.generateAccessToken(user);
        String newRefreshToken = rotated.newRawRefreshToken();

        return new AuthResponse(newAccessToken, newRefreshToken, AuthResponse.toUserSummary(user));
    }

    @Transactional(readOnly = true)
    public void sendForgotPasswordOtp(SendOtpRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();

        userRepository.findByEmailIgnoreCase(normalizedEmail).ifPresent(user -> {
            if (user.getEnabled()) {
                otpService.generateAndSendOtp(user.getEmail(), user.getName(), OtpPurpose.PASSWORD_RESET);
            }
        });
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException("Invalid request."));

        otpService.verifyOtp(normalizedEmail, request.code(), OtpPurpose.PASSWORD_RESET);

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        user.setEmailVerified(true);
        userRepository.save(user);

        refreshTokenService.revokeAllUserTokens(user);
    }

    private AuthResponse issueTokensForUser(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        String rawRefreshToken = refreshTokenService.createRefreshToken(user);
        return new AuthResponse(accessToken, rawRefreshToken, AuthResponse.toUserSummary(user));
    }
}
