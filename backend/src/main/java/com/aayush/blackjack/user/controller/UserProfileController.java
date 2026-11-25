package com.aayush.blackjack.user.controller;

import com.aayush.blackjack.auth.dto.OtpResponse;
import com.aayush.blackjack.user.dto.DeleteAccountWithOtpRequest;
import com.aayush.blackjack.user.dto.UpdatePasswordWithOtpRequest;
import com.aayush.blackjack.user.dto.UpdateProfileRequest;
import com.aayush.blackjack.user.dto.UserProfileResponse;
import com.aayush.blackjack.user.service.UserProfileService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users/me")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService userProfileService;

    @Value("${app.cookie.secure:false}")
    private boolean secureCookie;

    @GetMapping
    public ResponseEntity<UserProfileResponse> getCurrentProfile() {
        return ResponseEntity.ok(userProfileService.getCurrentProfile());
    }

    @PatchMapping(consumes = { MediaType.MULTIPART_FORM_DATA_VALUE, MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<UserProfileResponse> updateProfile(
            @Valid @ModelAttribute UpdateProfileRequest request
    ) {
        return ResponseEntity.ok(userProfileService.updateProfile(request));
    }

    @PostMapping("/password/otp")
    public ResponseEntity<OtpResponse> sendPasswordChangeOtp() {
        userProfileService.sendPasswordChangeOtp();
        return ResponseEntity.ok(
                new OtpResponse("A 6-character verification code has been sent to your email.")
        );
    }

    @PostMapping("/password")
    public ResponseEntity<OtpResponse> updatePasswordWithOtp(
            @Valid @RequestBody UpdatePasswordWithOtpRequest request
    ) {
        userProfileService.updatePasswordWithOtp(request);
        return ResponseEntity.ok(
                new OtpResponse("Password updated successfully.")
        );
    }

    @PostMapping("/delete/otp")
    public ResponseEntity<OtpResponse> sendAccountDeleteOtp() {
        userProfileService.sendAccountDeleteOtp();
        return ResponseEntity.ok(
                new OtpResponse("A 6-character account deletion code has been sent to your email.")
        );
    }

    @DeleteMapping
    public ResponseEntity<OtpResponse> deleteAccountWithOtp(
            @Valid @RequestBody DeleteAccountWithOtpRequest request,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader,
            HttpServletResponse response
    ) {
        userProfileService.deleteAccountWithOtp(request, authorizationHeader);
        clearRefreshCookie(response);
        return ResponseEntity.ok(
                new OtpResponse("Account deletion started. Your data is being cleaned up in the background.")
        );
    }

    private void clearRefreshCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("refresh_token", "")
                .httpOnly(true)
                .secure(secureCookie)
                .path("/api/v1/auth")
                .maxAge(0)
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}