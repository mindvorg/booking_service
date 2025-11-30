package com.example.controller;

import com.example.data.agent.AgentData;
import com.example.data.user.UserData;
import com.example.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }


    @PostMapping("/saveUser")
    public ResponseEntity<UserData> regUser(@RequestBody UserData user) {
        return ResponseEntity.ok(userService.saveUser(user));
    }

    @PostMapping("/saveAgent")
    public ResponseEntity<AgentData> regAgent(@RequestBody AgentData user) {
        return ResponseEntity.ok(userService.saveAgent(user));
    }

    @GetMapping("/profile")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<String> getUserProfile() {
        return ResponseEntity.ok("This is protected user profile");
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> getAdminData() {
        return ResponseEntity.ok("This is admin data");
    }

}
