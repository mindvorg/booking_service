package com.example.service;

import com.example.data.ApartmentsData;
import com.example.data.ApartmentsRepository;
import com.example.data.feedback.ApartFeedbackRepository;
import com.example.data.feedback.FeedbackData;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
@Slf4j
public class ApartmentsService {

    private final ApartmentsRepository apartmentsRepository;
    private final ApartFeedbackRepository apartFeedbackRepository;

    @Autowired
    public ApartmentsService(ApartmentsRepository apartmentsRepository, ApartFeedbackRepository apartFeedbackRepository) {
        this.apartmentsRepository = apartmentsRepository;
        this.apartFeedbackRepository = apartFeedbackRepository;
    }

    @Transactional
    public List<ApartmentsData> getAllRows() {
        return apartmentsRepository.findAll();
    }

    public Optional<ApartmentsData> findById(Long id) {
        return apartmentsRepository.findById(id);
    }

    @Transactional
    public List<ApartmentsData> getBySquare(Short square) {
        return apartmentsRepository.getAllBySquare(square);
    }

    @Transactional
//    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ApartmentsData saveApart(ApartmentsData apartmentsData) {
        return apartmentsRepository.save(apartmentsData);
    }


    public List<ApartmentsData> searchApartments(Long agentId, Short status, String district, Integer minSquare,
                                                 Integer maxSquare, Short minRooms, Short maxRooms, Short minFloor,
                                                 Short maxFloor, Integer minPrice, Integer maxPrice, Integer minHouseDate, Integer maxHouseDate, String sort) {
        return apartmentsRepository.findBySearchCriteria(
                agentId, status, district, minSquare, maxSquare,
                minRooms, maxRooms, minFloor, maxFloor, minPrice, maxPrice,
                minHouseDate, maxHouseDate, sort);
    }

    public List<ApartmentsData> getByDistrict(String district) {
        return apartmentsRepository.getAllByDistrict(district);
    }

    public List<ApartmentsData> getByAgent(Long agent) {
        return apartmentsRepository.getAllByAgentId(agent);
    }


    public List<ApartmentsData> searchByPrompt(String prompt) {
        return List.of();
        //        return apartmentsRepository.findBySearchText(prompt);
    }

    @Transactional
    public void deleteApartById(Long id) {
        apartFeedbackRepository.deleteAllByApartId(id);
        apartmentsRepository.deleteById(id);
    }

    public ApartmentsData updateApart(ApartmentsData dto, Long id) {
        Optional<ApartmentsData> existApart = apartmentsRepository.findById(id);
        if (existApart.isEmpty()) {
            throw new NoSuchElementException("no such aparts");
        }
        if (dto.getStatus() != null) {
            existApart.get().setStatus(dto.getStatus());
        }
        if (dto.getAddress() != null) {
            existApart.get().setAddress(dto.getAddress());
        }
        if (dto.getHouseDate() != null) {
            existApart.get().setHouseDate(dto.getHouseDate());
        }
        if (dto.getFloor() != null) {
            existApart.get().setFloor(dto.getFloor());
        }
        if (dto.getSquare() != null) {
            existApart.get().setSquare(dto.getSquare());
        }
        if (dto.getRoomNumber() != null) {
            existApart.get().setRoomNumber(dto.getRoomNumber());
        }
        if (dto.getPrice() != null) {
            existApart.get().setPrice(dto.getPrice());
        }
        if (dto.getPhoto() != null) {
            existApart.get().setPhoto(dto.getPhoto());
        }
        if (dto.getDescription() != null) {
            existApart.get().setDescription(dto.getDescription());
        }
        if (dto.getDistrict() != null) {
            existApart.get().setDistrict(dto.getDistrict());
        }
        return apartmentsRepository.save(existApart.get());
    }

    public List<FeedbackData> getFeedbackById(Long id) {
        return apartFeedbackRepository.getByApartId(id);
    }

    public FeedbackData saveFeedBack(FeedbackData feedbackData) {
        return apartFeedbackRepository.save(feedbackData);
    }
}
