package com.example.controller;

import com.example.data.user.UserData;
import com.example.service.UserService;
import com.example.utils.JwtTokenUtil;
import com.example.utils.TokenBlackList;
import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final JwtTokenUtil jwtTokenUtil;
    private final UserService userService;
    private final TokenBlackList tokenBlacklist;
    private final AuthenticationManager authenticationManager;

    public AuthController(JwtTokenUtil jwtTokenUtil, UserService userService, TokenBlackList tokenBlackList, AuthenticationManager authenticationManager) {
        this.jwtTokenUtil = jwtTokenUtil;
        this.userService = userService;
        this.tokenBlacklist = tokenBlackList;
        this.authenticationManager = authenticationManager;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequestDTO authRequest) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authRequest.getEmail(), authRequest.getPassword())
            );

            final UserDetails userDetails = userService.loadUserByUsername(authRequest.getEmail());
            final String token = jwtTokenUtil.generateToken(userDetails);

            UserData user = userService.findUserByEmail(authRequest.getEmail()).orElse(null);

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("email", authRequest.getEmail());

            if (user != null) {
                response.put("name", user.getName());
                response.put("role", user.getRole().name());
                response.put("id", user.getId());
                if (user.getRole() == com.example.data.user.UserRole.AGENT) {
                    UserService.AgentInfoDTO agentInfo = userService.getAgentInfo(user.getId());
                    if (agentInfo != null) {
                        response.put("agentId", agentInfo.getAgentId());
                        response.put("companyName", agentInfo.getCompanyName());
                        response.put("avatar", agentInfo.getAvatar());
                    }
                }
            }

            return ResponseEntity.ok(response);
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Неправильный email или пароль");
        }
    }

    @GetMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            tokenBlacklist.blacklistToken(token);

            return ResponseEntity.ok().body(Map.of(
                    "message", "Successfully logged out"
            ));
        }
        return ResponseEntity.badRequest().body(Map.of(
                "message", "Invalid token"
        ));
    }

    @Data
    public static class AuthRequestDTO {
        private String email;
        private String password;
    }

}