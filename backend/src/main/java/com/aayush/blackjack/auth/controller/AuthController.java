package com.aayush.blackjack.auth.controller;

import com.aayush.blackjack.auth.dto.*;
import com.aayush.blackjack.auth.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Value("${app.jwt.refresh-expiration-days:7}")
    private long refreshExpirationDays;

    @Value("${app.cookie.secure:false}")
    private boolean secureCookie;

    @PostMapping("/register")
    public ResponseEntity<OtpResponse> register(@Valid @RequestBody RegisterRequest request){
        authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(new OtpResponse(
                "Registration successful. Please check your email for the 6-character verification code."
        ));
    }

    @PostMapping("/otp/resend-verification")
    public ResponseEntity<OtpResponse> resendVerificationOtp(@Valid @RequestBody SendOtpRequest request) {
        authService.resendVerificationOtp(request);
        return ResponseEntity.ok(new OtpResponse("A new verification code has been sent to your email."));
    }

    @PostMapping("/otp/verify-email")
    public ResponseEntity<AuthResponse> verifyEmailOtp(@Valid @RequestBody VerifyOtpRequest request, HttpServletResponse response) {
        AuthResponse authResponse = authService.verifyEmailOtp(request);
        addRefreshCookie(response, authResponse.rawRefreshToken());
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response){
        AuthResponse authResponse = authService.login(request);
        addRefreshCookie(response, authResponse.rawRefreshToken());
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@CookieValue(name = "refresh_token", required = false) String rawRefreshToken, HttpServletResponse response){
        AuthResponse authResponse = authService.refreshTokens(rawRefreshToken);
        addRefreshCookie(response, authResponse.rawRefreshToken());
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/password/forgot")
    public ResponseEntity<OtpResponse> forgotPassword(@Valid @RequestBody SendOtpRequest request) {
        authService.sendForgotPasswordOtp(request);
        return ResponseEntity.ok(new OtpResponse("If an account exists for that email, a password reset code has been sent."));
    }

    @PostMapping("/password/reset")
    public ResponseEntity<OtpResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request, HttpServletResponse response) {
        authService.resetPassword(request);
        clearRefreshCookie(response);
        return ResponseEntity.ok(new OtpResponse("If an account exists for that email, a password reset code has been sent."));
    }

    @PostMapping("/logout")
    public ResponseEntity<OtpResponse> logout(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader,
            @CookieValue(name = "refresh_token", required = false) String refreshToken,
            HttpServletResponse response
    ) {
        authService.logout(authorizationHeader, refreshToken);
        clearRefreshCookie(response);
        return ResponseEntity.ok(new OtpResponse("Logged out successfully"));
    }

    private void addRefreshCookie(HttpServletResponse response, String rawToken) {
        ResponseCookie cookie = ResponseCookie.from("refresh_token", rawToken)
                .httpOnly(true)
                .secure(secureCookie)
                .path("/api/v1/auth")
                .maxAge(Duration.ofDays(refreshExpirationDays))
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
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
