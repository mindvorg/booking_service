package com.example.utils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;

import java.util.Arrays;
import java.util.Collections;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Autowired
    private JwtRequestFilter jwtRequestFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(configurer -> configurer.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .cors(corsCustomizer -> corsCustomizer.configurationSource(request -> {
                    CorsConfiguration config = new CorsConfiguration();
                    config.setAllowedOrigins(Arrays.asList(
                            "http://localhost:3000",
                            "http://localhost:5173"
                    ));
                    config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"));
                    config.setAllowCredentials(true);
                    config.setAllowedHeaders(Collections.singletonList("*"));
                    config.setExposedHeaders(Collections.singletonList("Authorization"));
                    config.setMaxAge(3600L);
                    return config;
                }))
                .authorizeHttpRequests(authz -> authz
                        // Публичные endpoints (доступны без аутентификации)
                        .requestMatchers("/auth/login").permitAll()
                        .requestMatchers("/users/registration").permitAll()
                        .requestMatchers("/users/saveAgent").permitAll()
                        .requestMatchers("/users/agents/**").permitAll()
                        .requestMatchers(HttpMethod.POST,"/users/agents/feedback/add").authenticated()

                        .requestMatchers("/photo/upload").permitAll()
                        .requestMatchers(HttpMethod.POST,"/photo/delete").authenticated()

                        // Сохранение квартир - только для авторизованных
                        .requestMatchers("/apartments/saveApart").authenticated()

                        // Просмотр квартир доступен всем
                        .requestMatchers(HttpMethod.GET, "/apartments/**").permitAll()

                        // Все остальные запросы требуют аутентификации
                        .anyRequest().authenticated()
                )
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                );

        http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
}