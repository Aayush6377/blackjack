package com.aayush.blackjack.user.service;

import com.aayush.blackjack.auth.enums.OtpPurpose;
import com.aayush.blackjack.auth.service.OtpService;
import com.aayush.blackjack.auth.service.RefreshTokenService;
import com.aayush.blackjack.media.dto.MediaUploadResult;
import com.aayush.blackjack.media.service.MediaStorageService;
import com.aayush.blackjack.security.jwt.JwtService;
import com.aayush.blackjack.security.service.CurrentUserService;
import com.aayush.blackjack.user.dto.*;
import com.aayush.blackjack.user.entity.User;
import com.aayush.blackjack.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final UserRepository userRepository;
    private final MediaStorageService mediaStorageService;
    private final OtpService otpService;
    private final RefreshTokenService refreshTokenService;
    private final JwtService jwtService;
    private final CurrentUserService currentUserService;
    private final PasswordEncoder passwordEncoder;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentProfile() {
        User user = currentUserService.getCurrentUser();
        return UserProfileResponse.from(user);
    }

    @Transactional
    public UserProfileResponse updateProfile(UpdateProfileRequest request) {
        User user = currentUserService.getCurrentUser();

        boolean hasFile = request.avatar() != null && !request.avatar().isEmpty();
        String trimmedUrl = request.profileImageUrl() != null ? request.profileImageUrl().trim() : "";
        boolean hasUrl = !trimmedUrl.isBlank();

        if (hasFile && hasUrl) {
            throw new IllegalArgumentException("Provide either an uploaded image file or an image URL, not both.");
        }

        if (request.name() != null && !request.name().isBlank()) {
            user.setName(request.name().trim());
        }

        if (Boolean.TRUE.equals(request.removeImage())) {
            removeImage(user);
        }
        else if (hasFile) {
            MultipartFile file = request.avatar();
            if (file.getContentType() == null || !file.getContentType().startsWith("image/")) {
                throw new IllegalArgumentException("Uploaded file must be a valid image.");
            }
            MediaUploadResult uploaded = mediaStorageService.uploadImage(file, "blackjack/avatars");
            removeImage(user);
            user.setProfileImageUrl(uploaded.url());
            user.setProfileImagePublicId(uploaded.publicId());
        }
        else if (hasUrl) {
            validateHttpUrl(trimmedUrl);
            removeImage(user);
            user.setProfileImageUrl(trimmedUrl);
            user.setProfileImagePublicId(null);
        }

        User saved = userRepository.save(user);
        return UserProfileResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public void sendPasswordChangeOtp() {
        User user = currentUserService.getCurrentUser();
        if (!Boolean.TRUE.equals(user.getEnabled())) {
            throw new IllegalStateException("Account is disabled.");
        }
        otpService.generateAndSendOtp(user.getEmail(), user.getName(), OtpPurpose.PASSWORD_RESET);
    }

    @Transactional
    public void updatePasswordWithOtp(UpdatePasswordWithOtpRequest request) {
        User user = currentUserService.getCurrentUser();
        String normalizedEmail = user.getEmail().trim().toLowerCase();

        otpService.verifyOtp(normalizedEmail, request.code(), OtpPurpose.PASSWORD_RESET);

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public void sendAccountDeleteOtp() {
        User user = currentUserService.getCurrentUser();
        otpService.generateAndSendOtp(user.getEmail(), user.getName(), OtpPurpose.ACCOUNT_DELETE);
    }

    @Transactional
    public void deleteAccountWithOtp(DeleteAccountWithOtpRequest request, String authorizationHeader) {
        User user = currentUserService.getCurrentUser();
        String normalizedEmail = user.getEmail().trim().toLowerCase();

        otpService.verifyOtp(normalizedEmail, request.code(), OtpPurpose.ACCOUNT_DELETE);

        String imagePublicId = user.getProfileImagePublicId();
        UUID userId = user.getId();

        user.setEnabled(false);
        user.setDeleted(true);
        user.setTokenVersion((user.getTokenVersion() == null ? 0 : user.getTokenVersion()) + 1);
        userRepository.save(user);

        refreshTokenService.revokeAllUserTokens(user);

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwtService.blacklistToken(authorizationHeader.substring(7));
        }

        eventPublisher.publishEvent(
                new AccountDeletionRequestedEvent(userId, normalizedEmail, imagePublicId)
        );
    }

    private void removeImage(User user){
        String publicId = user.getProfileImagePublicId();
        user.setProfileImageUrl(null);
        user.setProfileImagePublicId(null);

        if (publicId != null && !publicId.isBlank()){
            mediaStorageService.deleteImage(publicId);
        }
    }

    private void validateHttpUrl(String url) {
        try {
            URI uri = URI.create(url);
            String scheme = uri.getScheme();
            if (uri.getHost() == null || (!"http".equalsIgnoreCase(scheme) && !"https".equalsIgnoreCase(scheme))) {
                throw new IllegalArgumentException("Profile image URL must start with http:// or https://");
            }
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid profile image URL.");
        }
    }
}
