package com.example.data.agents_feedback;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AgentsFeedbackRepository extends JpaRepository<AgentsFeedbackData,Long> {
    List<AgentsFeedbackData>  getAllByAgentId(Long agentId);

    void deleteAllByAgentId(Long agentId);
}
