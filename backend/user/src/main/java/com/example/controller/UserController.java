package com.example.controller;

import com.example.data.UserDTO;
import com.example.data.agent.AgentData;
import com.example.data.user.UserData;
import com.example.data.user.UserRole;
import com.example.exceptions.UserAlreadyExistsException;
import com.example.service.UserService;
import com.example.utils.JwtTokenUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;
    private final JwtTokenUtil jwtTokenUtil;

    @Autowired
    public UserController(UserService userService, JwtTokenUtil jwtTokenUtil) {
        this.userService = userService;
        this.jwtTokenUtil = jwtTokenUtil;
    }

    /**
     * При регистрации выбирается роль и в зависимости от выбранной роли не обязательно есть еще компания и аватарка.
     */
    @PostMapping("/registration")
    public ResponseEntity<Map<String, Object>> regUser(@RequestBody UserDTO userDTO) {//сделать 409, если уже есть пользователь
        try {
            UserData tmp = UserData.builder()
                    .email(userDTO.getEmail())
                    .password(userDTO.getPassword())
                    .name(userDTO.getName())
                    .role(UserRole.valueOf(userDTO.getRole()))
                    .build();
            UserData userData = userService.saveUser(tmp);
            AgentData agentData = null;
            if (UserRole.valueOf(userDTO.getRole()).equals(UserRole.AGENT)) {
                AgentData tmpA = AgentData.builder()
                        .userId(userData.getId())
                        .avatar(userDTO.getAvatar())
                        .companyName(userDTO.getCompanyName())
                        .build();
                agentData = userService.saveAgent(tmpA);
            }

            final UserDetails userDetails = userService.loadUserByUsername(userData.getEmail());
            final String token = jwtTokenUtil.generateToken(userDetails);

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("email", userData.getEmail());

            response.put("name", userData.getName());
            response.put("role", userData.getRole().name());

            if (userData.getRole() == UserRole.AGENT) {
                if (agentData != null) {
                    response.put("agentId", agentData.getId());
                    response.put("companyName", agentData.getCompanyName());
                }
            }

            return ResponseEntity.ok().build();
        } catch (UserAlreadyExistsException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    @PatchMapping("/{id}")
    @Transactional
    public ResponseEntity<String> updateData(@RequestBody UserDTO userDTO, @PathVariable Long id) {
        UserData userData = UserData.builder()
                .id(id)
                .name(userDTO.getName())
                .email(userDTO.getEmail())
                .password(userDTO.getPassword())
                .build();
        userData = userService.updateUser(userData);
        if (userService.isAgent(id)) {
            AgentData agentData = AgentData.builder()
                    .userId(id)
                    .companyName(userDTO.getCompanyName())
                    .avatar(userDTO.getAvatar())
                    .build();
            userService.updateAgent(agentData);
        }
        final UserDetails userDetails = userService.loadUserByUsername(userData.getEmail());
        final String token = jwtTokenUtil.generateToken(userDetails);
        return ResponseEntity.ok(token);
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserData>> getAllUsers() {
        return ResponseEntity.ok(userService.findAllUsers());
    }

    @GetMapping("/agents/{userId}")
    public ResponseEntity<UserService.AgentInfoDTO> getAgentInfo(@PathVariable Long userId) {
        UserService.AgentInfoDTO agentInfo = userService.getAgentInfo(userId);
        if (agentInfo != null) {
            return ResponseEntity.ok(agentInfo);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/agents/all")
    public ResponseEntity<List<AgentData>> getAllAgents() {
        return ResponseEntity.ok(userService.findAllAgents());
    }

    @GetMapping("/agents/feedback/{userId}")
    public ResponseEntity<?> getFeedbackById(@PathVariable Long userId) {
        return ResponseEntity.ok().build();
    }

}
