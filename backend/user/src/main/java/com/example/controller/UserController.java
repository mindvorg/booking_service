package com.example.controller;

import com.example.data.UserDTO;
import com.example.data.agent.AgentData;
import com.example.data.agents_feedback.AgentsFeedbackData;
import com.example.data.user.UserData;
import com.example.data.user.UserRole;
import com.example.exceptions.UserAlreadyExistsException;
import com.example.service.FeedbackService;
import com.example.service.UserService;
import com.example.utils.JwtTokenUtil;
import jakarta.annotation.PostConstruct;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    private final FeedbackService feedBackService;

    @Autowired
    public UserController(UserService userService, JwtTokenUtil jwtTokenUtil, FeedbackService feedBackService) {
        this.userService = userService;
        this.jwtTokenUtil = jwtTokenUtil;
        this.feedBackService = feedBackService;
    }

    @PostConstruct
    public void init() {
        if (userService.findUserByEmail("admin@admin.com").isEmpty()) {
            UserData tmp = UserData.builder()
                    .email("admin@admin.com")
                    .password("admin")
                    .name("admin")
                    .role(UserRole.ADMIN)
                    .build();
            userService.saveUser(tmp);
        }
    }

    /**
     * При регистрации выбирается роль и в зависимости от выбранной роли не обязательно есть еще компания и аватарка.
     */
    @PostMapping("/registration")
    public ResponseEntity<Map<String, Object>> regUser(@RequestBody UserDTO userDTO) {//сделать 409, если уже есть пользователь
        if (UserRole.valueOf(userDTO.getRole()).equals(UserRole.ADMIN))
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
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
//    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.findAllUsers().stream()
                .map(e -> UserDTO.builder()
                        .id(e.getId())
                        .role(e.getRole().name())
                        .name(e.getName())
                        .email(e.getEmail())
                        .build()).toList());
    }

    @GetMapping("/agents/{agentId}")
    public ResponseEntity<UserService.AgentInfoDTO> getAgentInfo(@PathVariable Long agentId) {
        UserService.AgentInfoDTO agentInfo = userService.getAgentInfo(agentId);
        if (agentInfo != null) {
            return ResponseEntity.ok(agentInfo);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/agents/all")
    public ResponseEntity<List<UserService.AgentInfoDTO>> getAllAgents() {
        return ResponseEntity.ok(userService.findAllAgents());
    }

    @GetMapping("/agents/feedback/{agentId}")
    public ResponseEntity<List<AgentsFeedbackData>> getFeedbackOnAgentById(@PathVariable Long agentId) {
        List<AgentsFeedbackData> feedbacks = feedBackService.getFeedbackOnAgentById(agentId);
        return ResponseEntity.ok(feedbacks);
    }

    @PostMapping("/agents/feedback/add")
//    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> addFeedbackOnAgent(@RequestBody AgentsFeedbackData feedback) {
        return ResponseEntity.ok(feedBackService.saveFeedback(feedback));
    }

    @PatchMapping("/admin/changeRole")
//    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> changeRole(@RequestBody AdminRequestDTO adminRequestDTO) {
        return ResponseEntity.ok(userService.changeRole(adminRequestDTO));
    }

    @Data
    public static class AdminRequestDTO {
        private Long id;
        private UserRole role;
    }
}
