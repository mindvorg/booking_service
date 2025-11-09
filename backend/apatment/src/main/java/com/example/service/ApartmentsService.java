package com.example.service;

import com.example.data.ApartmentsData;
import com.example.data.ApartmentsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ApartmentsService {

    private final ApartmentsRepository apartmentsRepository;
    private final UserService userService;

    @Autowired
    public ApartmentsService(ApartmentsRepository apartmentsRepository, UserService userService) {
        this.apartmentsRepository = apartmentsRepository;
        this.userService = userService;
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

    public ApartmentsData saveApart(ApartmentsData apartmentsData) {
        userService.findAgentById(Long.valueOf(apartmentsData.getAgentId()))
                .orElseThrow(() -> new NoSuchFieldError("User not found with id: " + apartmentsData.getAgentId()));
        return apartmentsRepository.save(apartmentsData);
    }
    public List<ApartmentsData> searchApartments(String district, Integer minPrice, Integer maxPrice, Short minRooms, Short maxRooms, String status, String apartType){

        return apartmentsRepository.findBySearchCriteria(
                district, minPrice, maxPrice, minRooms, maxRooms, status, apartType);    }

    public List<ApartmentsData> getByDistrict(String district) {
        return apartmentsRepository.getAllByDistrict(district);
    }

    public List<ApartmentsData> getByAgent(Long agent) {
        return apartmentsRepository.getAllByAgentId(agent);
    }
}
