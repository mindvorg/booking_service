package com.example.data.feedback;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeedbackRepository extends JpaRepository<FeedbackData,Long> {
    List<FeedbackData> getByApartId(Long id);
}
