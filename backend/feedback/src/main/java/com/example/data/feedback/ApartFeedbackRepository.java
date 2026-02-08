package com.example.data.feedback;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApartFeedbackRepository extends JpaRepository<FeedbackData,Long> {
    List<FeedbackData> getByApartId(Long id);

    void deleteAllByApartId(Long apartId);
}
