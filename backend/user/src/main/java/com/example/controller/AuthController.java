package com.example.controller;

import com.example.data.user.UserData;
import com.example.service.UserService;
import com.example.utils.JwtTokenUtil;
import com.example.utils.TokenBlackList;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
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

    public AuthController(JwtTokenUtil jwtTokenUtil, UserService userService, TokenBlackList tokenBlackList) {
        this.jwtTokenUtil = jwtTokenUtil;
        this.userService = userService;
        this.tokenBlacklist = tokenBlackList;
    }

    //DTO(name,mail,role)+token
    @PostMapping("/login")
    public ResponseEntity<?> createAuthToken(@RequestBody AuthRequestDTO authRequest) {//убрать токен
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
                }
            }
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
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