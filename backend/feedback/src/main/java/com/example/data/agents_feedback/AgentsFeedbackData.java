package com.example.data.agents_feedback;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "feedbacks_on_agent")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AgentsFeedbackData {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long agentId;

    private Long userId;

    private String text;
}
