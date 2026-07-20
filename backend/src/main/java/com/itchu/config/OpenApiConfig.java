package com.itchu.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI itChuManagerOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("IT-CHU Manager API")
                        .description("API REST de gestion de projets IT pour CHU")
                        .version("0.1.0")
                        .contact(new Contact().name("Equipe IT-CHU Manager")));
    }
}
