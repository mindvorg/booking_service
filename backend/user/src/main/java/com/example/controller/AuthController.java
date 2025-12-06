package com.example.controller;

import com.example.data.user.UserData;
import com.example.service.UserService;
import com.example.utils.JwtTokenUtil;
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

    private final AuthenticationManager authenticationManager;
    private final JwtTokenUtil jwtTokenUtil;
    private final UserService userService;

    public AuthController(AuthenticationManager authenticationManager, JwtTokenUtil jwtTokenUtil, UserService userService) {
        this.authenticationManager = authenticationManager;
        this.jwtTokenUtil = jwtTokenUtil;
        this.userService = userService;
    }

    //DTO(name,mail,role)+token
    @PostMapping("/login")
    public ResponseEntity<?> createAuthToken(@RequestBody AuthRequestDTO authRequest) {
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                    authRequest.getEmail(),
                    authRequest.getPassword()
            ));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
        final UserDetails userDetails = userService.loadUserByUsername(authRequest.getEmail());
        final String token = jwtTokenUtil.generateToken(userDetails);

        UserData user = userService.findUserByEmail(authRequest.getEmail()).orElse(null);
        Map<String, Object> response = new HashMap<>();
        response.put("token",token);
        response.put("email",authRequest.getEmail());

        if (user != null) {
            response.put("name", user.getName());
            response.put("role", user.getRole().name());

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
    @GetMapping("/login/test")
    public ResponseEntity<String> test(){
        return ResponseEntity.ok("test");
    }
    @Data
    public static class AuthRequestDTO {
        private String email;
        private String password;
    }

}