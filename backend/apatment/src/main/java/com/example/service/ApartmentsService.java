package com.example.service;

import com.example.data.ApartmentsData;
import com.example.data.ApartmentsRepository;
import com.example.data.agent.AgentData;
import com.example.data.feedback.FeedbackData;
import com.example.data.feedback.FeedbackRepository;
import com.example.data.user.UserData;
import com.example.data.user.UserRole;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
@Slf4j
public class ApartmentsService {

    private final ApartmentsRepository apartmentsRepository;
    private final UserService userService;
    private final FeedbackRepository feedbackRepository;

    @Autowired
    public ApartmentsService(ApartmentsRepository apartmentsRepository, UserService userService, FeedbackRepository feedbackRepository) {
        this.apartmentsRepository = apartmentsRepository;
        this.userService = userService;
        this.feedbackRepository = feedbackRepository;
    }

    @Transactional
    public List<ApartmentsData> getAllRows() {
//        System.err.println(333);
//        apartmentsRepository.findAll().forEach(e -> System.err.println(
//                e.getAddress() + " " + e.getPrice()
//        ));
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

//    public List<ApartmentsData> searchApartments(String district, Integer minPrice, Integer maxPrice, Short minRooms, Short maxRooms, String status, String apartType) {
//        return apartmentsRepository.findBySearchCriteria(
//                district, minPrice, maxPrice, minRooms, maxRooms, status, apartType);
//    }

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

    @PreAuthorize("isAuthenticated()")
    public List<ApartmentsData> getMyApartments() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserEmail = authentication.getName();

        // Находим пользователя по email
        Optional<UserData> user = userService.findUserByEmail(currentUserEmail);
        if (user.isEmpty()) {
            return new ArrayList<>();
        }

        UserData userData = user.get();

        // Если это агент, возвращаем его квартиры
        if (userData.getRole() == UserRole.AGENT) {
            return apartmentsRepository.getAllByAgentId(userData.getId());
        }

        // Если это обычный пользователь, можно вернуть избранные квартиры
        // Пока возвращаем пустой список
        return new ArrayList<>();
    }

    public List<ApartmentsData> searchByPrompt(String prompt) {
        return List.of();
        //        return apartmentsRepository.findBySearchText(prompt);
    }

    public UserService.AgentInfoDTO getAgentInfoForApartment(Long apartmentId) {
        Optional<ApartmentsData> apartment = apartmentsRepository.findById(apartmentId);
        if (apartment.isPresent()) {
            Long agentId = apartment.get().getAgentId();
            return userService.getAgentInfo(agentId);
        }
        return null;
    }

    public void deleteApartById(Long id) {
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
        if (dto.getApartType() != null) {
            existApart.get().setApartType(dto.getApartType());
        }
        if (dto.getGeotag() != null) {
            existApart.get().setGeotag(dto.getGeotag());
        }
        return apartmentsRepository.save(existApart.get());
    }

    public List<FeedbackData> getFeedbackById(Long id) {
        return feedbackRepository.getByApartId(id);
    }

    public FeedbackData saveFeedBack(FeedbackData feedbackData) {
        return feedbackRepository.save(feedbackData);
    }
}
