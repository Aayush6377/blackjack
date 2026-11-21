package com.aayush.blackjack.security.jwt;

import com.aayush.blackjack.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class JwtService {
    private static final String BLACKLIST_PREFIX = "blackjack:jwt:blacklist:";

    private final JwtEncoder jwtEncoder;
    private final JwtDecoder jwtDecoder;
    private final StringRedisTemplate redisTemplate;

    @Value("${app.jwt.issuer:blackjack-api}")
    private String issuer;

    @Value("${app.jwt.access-expiration-seconds:900}")
    private long accessExpirationSeconds;

    public String generateAccessToken(User user){
        Instant now = Instant.now();

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(issuer)
                .issuedAt(now)
                .expiresAt(now.plusSeconds(accessExpirationSeconds))
                .subject(user.getId().toString())
                .id(UUID.randomUUID().toString())  // jti for Redis blacklist
                .claim("email", user.getEmail())
                .claim("role", user.getRole().name())
                .claim("tokenVersion", user.getTokenVersion())
                .build();

        JwsHeader jwsHeader = JwsHeader.with(MacAlgorithm.HS256).build();
        return jwtEncoder.encode(JwtEncoderParameters.from(jwsHeader, claims))
                .getTokenValue();
    }

    public Jwt decodeAndValidate(String token){
        Jwt jwt = jwtDecoder.decode(token);
        String jti = jwt.getId();
        if (jti != null && Boolean.TRUE.equals(redisTemplate.hasKey(BLACKLIST_PREFIX + jti))){
            throw new JwtException("Token has been revoked");
        }

        return jwt;
    }

    public void blacklistToken(String token){
        try {
            Jwt jwt = jwtDecoder.decode(token);
            String jti = jwt.getId();
            Instant expiresAt = jwt.getExpiresAt();

            if (jti != null && expiresAt != null){
                Duration remainingTtl = Duration.between(Instant.now(), expiresAt);
                if (!remainingTtl.isNegative() && !remainingTtl.isZero()){
                    redisTemplate.opsForValue().set(BLACKLIST_PREFIX + jti, "revoked", remainingTtl);
                }
            }
        } catch (JwtException ignore) {}
    }
}
