package com.example.service;

import com.example.data.agents_feedback.AgentsFeedbackData;
import com.example.data.agents_feedback.AgentsFeedbackRepository;
import com.example.data.feedback.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FeedbackService {

    private final AgentsFeedbackRepository agentsFeedbackRepository;

    private final FeedbackRepository feedbackRepository;

    @Autowired
    public FeedbackService(AgentsFeedbackRepository agentsFeedbackRepository, FeedbackRepository feedbackRepository) {
        this.agentsFeedbackRepository = agentsFeedbackRepository;
        this.feedbackRepository = feedbackRepository;
    }

    public List<AgentsFeedbackData> getFeedbackOnAgentById(Long agentId) {
        return agentsFeedbackRepository.getAllByAgentId(agentId);
    }

    public AgentsFeedbackData saveFeedback(AgentsFeedbackData feedback) {
        return agentsFeedbackRepository.save(feedback);
    }
}
