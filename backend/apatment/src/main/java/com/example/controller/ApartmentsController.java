package com.example.controller;

import com.example.service.PhotoService;
import com.example.data.ApartmentsData;
import com.example.service.ApartmentsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/apartments")
@CrossOrigin(origins = "*")
public class ApartmentsController {

    private final ApartmentsService apartmentsService;
    private final PhotoService photoService;

    @Autowired
    public ApartmentsController(ApartmentsService apartmentsService, PhotoService photoService) {
        this.apartmentsService = apartmentsService;
        this.photoService = photoService;
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

    //http://localhost:8080/apartments/search?minPrice=12500001&minRooms=3
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

    @GetMapping("/searchText")
    public ResponseEntity<List<ApartmentsData>> searchByText(String prompt) {
        return ResponseEntity.ok(apartmentsService.searchByPrompt(prompt));
    }



}
