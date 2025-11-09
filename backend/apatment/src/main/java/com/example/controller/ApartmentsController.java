package com.example.controller;

import com.example.data.ApartmentsData;
import com.example.service.ApartmentsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/apartments")
public class ApartmentsController {

    private final ApartmentsService apartmentsService;

    @Autowired
    public ApartmentsController(ApartmentsService apartmentsService) {
        this.apartmentsService = apartmentsService;
    }

    @GetMapping("/all")
    public ResponseEntity<List<ApartmentsData>> getAllAparts() {
        return ResponseEntity.ok(apartmentsService.getAllRows());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApartmentsData> getApartment(@PathVariable Long id) {
        return apartmentsService.findById(id).map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PostMapping("/saveApart")
    public ResponseEntity<ApartmentsData> saveApartment(@RequestBody ApartmentsData apart) {
        return ResponseEntity.ok(apartmentsService.saveApart(apart));
    }

    @GetMapping("/search")
    public ResponseEntity<List<ApartmentsData>> searchAparts(
            @RequestParam(required = false) String district,
            @RequestParam(required = false) Integer minPrice,
            @RequestParam(required = false) Integer maxPrice,
            @RequestParam(required = false) Short minRooms,
            @RequestParam(required = false) Short maxRooms,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String apartType) {

        List<ApartmentsData> apartments = apartmentsService.searchApartments(
                district, minPrice, maxPrice, minRooms, maxRooms, status, apartType);
        return ResponseEntity.ok(apartments);
    }

//    @GetMapping("/district/{district}")
//    public ResponseEntity<List<ApartmentsData>> getByDistrict(@PathVariable String district){
//        return ResponseEntity.ok(apartmentsService.getByDistrict(district));
//    }
//    @GetMapping("/agent/{agent}")
//    public ResponseEntity<List<ApartmentsData>> getByAgent(@PathVariable Long agent){
//        return ResponseEntity.ok(apartmentsService.getByAgent(agent));
//    }
//    @GetMapping("/price-range")
//    public ResponseEntity<List<ApartmentsData>> getApartmentsByPriceRange(
//            @RequestParam(required = false) Integer minPrice,
//            @RequestParam(required = false) Integer maxPrice) {
//        List<ApartmentsData> apartments = apartmentsService.findByPriceRange(minPrice, maxPrice);
//        return ResponseEntity.ok(apartments);
//    }
}
