package com.example.service;

import com.example.data.agent.AgentData;
import com.example.data.agent.AgentRepository;
import com.example.data.user.UserData;
import com.example.data.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
public class UserService {

    private final AgentRepository agentRepository;

    private final UserRepository userRepository;

    @Autowired
    public UserService(AgentRepository agentRepository, UserRepository userRepository) {
        this.agentRepository = agentRepository;
        this.userRepository = userRepository;
    }

    public UserData saveUser(UserData user) {
        return userRepository.save(user);
    }

    public AgentData saveAgent(AgentData agentData) {
        userRepository.findById(agentData.getUserId())
                .orElseThrow(() -> new NoSuchFieldError("User not found with id: " + agentData.getUserId()));
        return agentRepository.save(agentData);
    }
    public Optional<AgentData> findAgentById(Long id){
        return agentRepository.findById(id);
    }

    public UserDetails loadUserByUsername(String username) {
        UserData user= userRepository.findByEmail(username).orElseThrow(()-> new UsernameNotFoundException("User not found"));

        return User
                .withUsername(user.getEmail())
                .password(user.getPassword())
                .authorities(user.getRole().toString())
                .build();
    }
}
