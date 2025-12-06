package com.example.data.agent;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AgentRepository extends JpaRepository<AgentData,Long> {
    Optional<AgentData> findByUserId(Long userId);

    boolean existsByUserId(Long userId);
}
