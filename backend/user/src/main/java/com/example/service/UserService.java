package com.example.service;

import com.example.controller.UserController;
import com.example.data.ApartmentsData;
import com.example.data.agent.AgentData;
import com.example.data.agent.AgentRepository;
import com.example.data.user.UserData;
import com.example.data.user.UserRepository;
import com.example.data.user.UserRole;
import com.example.exceptions.UserAlreadyExistsException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final AgentRepository agentRepository;
    private final ApartmentsService apartmentsService;
    private final PasswordEncoder passwordEncoder;
    private final FeedbackService feedbackService;
    private final PhotoService photoService;

    @Autowired
    public UserService(UserRepository userRepository,
                       AgentRepository agentRepository, ApartmentsService apartmentsService, PasswordEncoder passwordEncoder, FeedbackService feedbackService, PhotoService photoService) {
        this.userRepository = userRepository;
        this.agentRepository = agentRepository;
        this.apartmentsService = apartmentsService;
        this.passwordEncoder = passwordEncoder;
        this.feedbackService = feedbackService;
        this.photoService = photoService;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
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
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new UserAlreadyExistsException("User already exists");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));

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
            throw new UserAlreadyExistsException("User already exists");
        }
        return agentRepository.save(agentDTO);
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

    public AgentInfoDTO getAgentInfo(Long agentId) {
        Optional<AgentData> agent = agentRepository.findById(agentId);
        Optional<UserData> user = userRepository.findById(agent.get().getUserId());

        if (user.isEmpty() || agent.isEmpty()) {
            return null;
        }

        return new AgentInfoDTO(user.get(), agent.get());
    }

    public List<UserData> findAllUsers() {
        return userRepository.findAll();
    }

    public List<AgentData> findAllAgents() {
        List<AgentData> agents = agentRepository.findAll();
        return agents;
    }

    @Transactional
    public void deleteUser(Long id) {
        // Удаляем сначала агента, если он есть
        Optional<AgentData> agent = agentRepository.findByUserId(id);
        agent.ifPresent(agentData -> agentRepository.deleteById(agentData.getId()));

        // Затем удаляем пользователя
        userRepository.deleteById(id);
    }


    @Transactional
    public UserData updateUser(UserData userData) {
        UserData existUser = userRepository.findById(userData.getId()).orElseThrow(
                () -> new UsernameNotFoundException("Пользователь с ID " + userData.getId() + " не найден")
        );
        if (userData.getPassword() != null) {
            existUser.setPassword(passwordEncoder.encode(userData.getPassword()));
        }
        if (userData.getEmail() != null) {
            existUser.setEmail(userData.getEmail());
        }
        if (userData.getName() != null) {
            existUser.setName(userData.getName());
        }
        return userRepository.save(existUser);
    }

    @Transactional
    public void updateAgent(AgentData agentData) {
        AgentData existAgent = agentRepository.findByUserId(agentData.getUserId()).orElseThrow(
                () -> new UsernameNotFoundException("Agent с ID " + agentData.getUserId() + " не найден")
        );
        if (agentData.getAvatar() != null) {
            existAgent.setAvatar(agentData.getAvatar());
        }
        if (agentData.getCompanyName() != null) {
            existAgent.setCompanyName(agentData.getCompanyName());
        }
        agentRepository.save(existAgent);
    }

    public boolean isAgent(Long id) {
        return agentRepository.existsByUserId(id);
    }

    @Transactional
    public UserData changeRole(UserController.AdminRequestDTO adminRequestDTO) {
        UserData existData = userRepository.findById(adminRequestDTO.getId()).orElseThrow(() ->
                new NoSuchElementException("no such user"));
        if (existData.getRole() == UserRole.AGENT && adminRequestDTO.getRole() == UserRole.USER) {
            AgentData agentData = agentRepository.findByUserId(existData.getId()).get();
            List<ApartmentsData> apartmentsDataList = apartmentsService.getByAgent(agentData.getId());
            apartmentsDataList.forEach(apart -> {
                feedbackService.deleteApartsFeedbackByApartId(apart.getId());
                if (!apart.getPhoto().isEmpty()) {
                    photoService.deletePhotosFromS3(Arrays.stream(apart.getPhoto().split(",")).toList());
                }
                apartmentsService.deleteApartById(apart.getId());
            });
            feedbackService.deleteAgentsFeedbackByAgentId(agentData.getId());
            if (agentData.getAvatar()!=null) {
                photoService.deletePhotosFromS3(List.of(agentData.getAvatar()));
            }
            agentRepository.deleteByUserId(existData.getId());
        }
        if (existData.getRole() == UserRole.USER && adminRequestDTO.getRole() == UserRole.AGENT) {
            agentRepository.save(AgentData.builder().userId(existData.getId()).avatar("").companyName("").build());
        }
        existData.setRole(adminRequestDTO.getRole());
        return userRepository.save(existData);
    }


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