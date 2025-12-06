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

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Autowired
    private JwtRequestFilter jwtRequestFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(authz -> authz
                                // Публичные endpoints (доступны без аутентификации)
                                .requestMatchers("/auth/login").permitAll()
                                .requestMatchers("/auth/login/test").permitAll()
                                .requestMatchers("/users/registration").permitAll()
//                                .requestMatchers("/users/agents").permitAll()
                                .requestMatchers(HttpMethod.GET, "/apartments/**").permitAll()

                                // Загрузка фото должна быть защищена (только для агентов)
                                .requestMatchers(HttpMethod.POST, "/photo/**").authenticated()

                                // Удаление фото должно быть защищено
                                .requestMatchers(HttpMethod.DELETE, "/photo/**").authenticated()

                                // Сохранение квартир - только для авторизованных
                                .requestMatchers(HttpMethod.POST, "/apartments/saveApart").authenticated()


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