package com.example.service;

import com.example.data.agents_feedback.AgentsFeedbackData;
import com.example.data.agents_feedback.AgentsFeedbackRepository;
import com.example.data.feedback.ApartFeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FeedbackService {

    private final AgentsFeedbackRepository agentsFeedbackRepository;

    private final ApartFeedbackRepository apartFeedbackRepository;

    @Autowired
    public FeedbackService(AgentsFeedbackRepository agentsFeedbackRepository, ApartFeedbackRepository apartFeedbackRepository) {
        this.agentsFeedbackRepository = agentsFeedbackRepository;
        this.apartFeedbackRepository = apartFeedbackRepository;
    }

    public List<AgentsFeedbackData> getFeedbackOnAgentById(Long agentId) {
        return agentsFeedbackRepository.getAllByAgentId(agentId);
    }

    public AgentsFeedbackData saveFeedback(AgentsFeedbackData feedback) {
        return agentsFeedbackRepository.save(feedback);
    }
    public void deleteAgentsFeedbackByAgentId(Long agentId){
        agentsFeedbackRepository.deleteAllByAgentId((agentId));
    }
    public void deleteApartsFeedbackByApartId(Long apartId){
        apartFeedbackRepository.deleteAllByApartId(apartId);
    }
}
