package com.example.service;

import com.example.data.agents_feedback.AgentsFeedbackRepository;
import com.example.data.feedback.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class FeedbackService {

    private final AgentsFeedbackRepository agentsFeedbackRepository;

    private final FeedbackRepository feedbackRepository;

    @Autowired
    public FeedbackService(AgentsFeedbackRepository agentsFeedbackRepository, FeedbackRepository feedbackRepository) {
        this.agentsFeedbackRepository = agentsFeedbackRepository;
        this.feedbackRepository = feedbackRepository;
    }
}
