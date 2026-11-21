package com.aayush.blackjack.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    private static final String BEARER_SCHEME_NAME = "BearerAuth";

    @Bean
    public OpenAPI blackjackOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Blackjack Royale API")
                        .description("Enterprise Blackjack Gaming Platform — Auth, Immutable Chip Ledger, Game Engine, Rewards & Payments")
                        .version("v1.0.0")
                        .contact(new Contact()
                                .name("Aayush Kukreja")))
                .addSecurityItem(new SecurityRequirement().addList(BEARER_SCHEME_NAME))
                .components(new Components()
                        .addSecuritySchemes(BEARER_SCHEME_NAME, new SecurityScheme()
                                .name(BEARER_SCHEME_NAME)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Paste your JWT Access Token here (without the 'Bearer ' prefix)")));
    }
}
