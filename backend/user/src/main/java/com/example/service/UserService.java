package com.example.service;

import com.example.data.agent.AgentData;
import com.example.data.agent.AgentRepository;
import com.example.data.user.UserData;
import com.example.data.user.UserRepository;
import com.example.data.user.UserRole;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final AgentRepository agentRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository,
                       AgentRepository agentRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.agentRepository = agentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Ищем пользователя по email
        Optional<UserData> user = userRepository.findByEmail(username);
        if (user.isEmpty()) {
            throw new UsernameNotFoundException("User not found with email: " + username);
        }

        UserData userData = user.get();
        Collection<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_" + userData.getRole().name()));

        // Если это агент, добавляем дополнительную информацию
        if (userData.getRole() == UserRole.AGENT) {
            authorities.add(new SimpleGrantedAuthority("ROLE_AGENT_DETAILS"));
        }

        return new org.springframework.security.core.userdetails.User(
                userData.getEmail(),
                userData.getPassword(),
                true, // enabled
                true, // accountNonExpired
                true, // credentialsNonExpired
                true, // accountNonLocked
                authorities
        );
    }

    @Transactional
    public UserData saveUser(UserData user) {
        // Шифруем пароль
//        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Если роль не указана, устанавливаем USER по умолчанию
        if (user.getRole() == null) {
            user.setRole(UserRole.USER);
        }

        return userRepository.save(user);
    }

    public UserData getUser(Long id) {
        return userRepository.getById(id);
    }

    @Transactional
    public AgentData saveAgent(AgentData agentDTO) {
        if (agentRepository.existsByUserId(agentDTO.getUserId())) {
            throw new RuntimeException("User already exists");
        }
        return agentRepository.save(agentDTO);
    }

    @Transactional
    public AgentData saveAgentWithUserId(AgentData agentData) {
        // Проверяем, существует ли пользователь
        Optional<UserData> user = userRepository.findById(agentData.getUserId());
        if (user.isEmpty()) {
            throw new RuntimeException("User not found with id: " + agentData.getUserId());
        }

        // Проверяем, не является ли уже агентом
        if (agentRepository.findByUserId(agentData.getUserId()).isPresent()) {
            throw new RuntimeException("User is already an agent");
        }

        // Обновляем роль пользователя на AGENT
        UserData userData = user.get();
        userData.setRole(UserRole.AGENT);
        userRepository.save(userData);

        return agentRepository.save(agentData);
    }

    public Optional<UserData> findUserById(Long id) {
        return userRepository.findById(id);
    }

    public Optional<UserData> findUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<AgentData> findAgentByUserId(Long userId) {
        return agentRepository.findByUserId(userId);
    }

    public Optional<AgentData> findAgentByUserEmail(String email) {
        Optional<UserData> user = userRepository.findByEmail(email);
        if (user.isPresent() && user.get().getRole() == UserRole.AGENT) {
            return agentRepository.findByUserId(user.get().getId());
        }
        return Optional.empty();
    }

    public AgentInfoDTO getAgentInfo(Long userId) {
        Optional<UserData> user = userRepository.findById(userId);
        Optional<AgentData> agent = agentRepository.findByUserId(userId);

        if (user.isEmpty() || agent.isEmpty()) {
            return null;
        }

        return new AgentInfoDTO(user.get(), agent.get());
    }

    public List<UserData> findAllUsers() {
        return userRepository.findAll();
    }

    public List<AgentInfoDTO> findAllAgents() {
        List<AgentInfoDTO> agentsInfo = new ArrayList<>();
        List<AgentData> agents = agentRepository.findAll();

        for (AgentData agent : agents) {
            Optional<UserData> user = userRepository.findById(agent.getUserId());
            user.ifPresent(userData -> agentsInfo.add(new AgentInfoDTO(userData, agent)));
        }

        return agentsInfo;
    }

    @Transactional
    public void deleteUser(Long id) {
        // Удаляем сначала агента, если он есть
        Optional<AgentData> agent = agentRepository.findByUserId(id);
        agent.ifPresent(agentData -> agentRepository.deleteById(agentData.getId()));

        // Затем удаляем пользователя
        userRepository.deleteById(id);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    // DTO для регистрации агента


    // DTO для полной информации об агенте
    public static class AgentInfoDTO {
        private Long userId;
        private String email;
        private String name;
        private UserRole role;
        private Long agentId;
        private String companyName;
        private String avatar;

        public AgentInfoDTO(UserData user, AgentData agent) {
            this.userId = user.getId();
            this.email = user.getEmail();
            this.name = user.getName();
            this.role = user.getRole();
            this.agentId = agent.getId();
            this.companyName = agent.getCompanyName();
            this.avatar = agent.getAvatar();
        }

        // getters
        public Long getUserId() {
            return userId;
        }

        public String getEmail() {
            return email;
        }

        public String getName() {
            return name;
        }

        public UserRole getRole() {
            return role;
        }

        public Long getAgentId() {
            return agentId;
        }

        public String getCompanyName() {
            return companyName;
        }

        public String getAvatar() {
            return avatar;
        }
    }
}