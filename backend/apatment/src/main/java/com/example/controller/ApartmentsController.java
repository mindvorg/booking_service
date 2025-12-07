package com.example.controller;

import com.example.data.feedback.FeedbackData;
import com.example.service.PhotoService;
import com.example.data.ApartmentsData;
import com.example.service.ApartmentsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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

    @PatchMapping("/{id}")
//    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<ApartmentsData> patchApartment(@RequestBody ApartmentsData apart, @PathVariable Long id) {
        return ResponseEntity.ok(apartmentsService.updateApart(apart, id));
    }

    @PostMapping("/{id}")
//    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<Boolean> deleteApartment(@PathVariable Long id) {
        apartmentsService.deleteApartById(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/saveApart")
    public ResponseEntity<ApartmentsData> saveApartment(@RequestBody ApartmentsData apart) {
        return ResponseEntity.ok(apartmentsService.saveApart(apart));
    }

    //http://localhost:8080/apartments/search?minPrice=12500001&minRooms=3
    @GetMapping("/search")
    public ResponseEntity<List<ApartmentsData>> filterAparts(
            @RequestParam(required = false) Long agentId,
            @RequestParam(required = false) Short status,//0-buy 1- rent
            @RequestParam(required = false) String district,
            @RequestParam(required = false) Integer minSquare,
            @RequestParam(required = false) Integer maxSquare,
            @RequestParam(required = false) Short minRooms,
            @RequestParam(required = false) Short maxRooms,
            @RequestParam(required = false) Short minFloor,
            @RequestParam(required = false) Short maxFloor,
            @RequestParam(required = false) Integer minPrice,
            @RequestParam(required = false) Integer maxPrice,
            @RequestParam(required = false) Integer minHouseDate,
            @RequestParam(required = false) Integer maxHouseDate,
            @RequestParam(required = false) String sort
    ) {

        List<ApartmentsData> apartments = apartmentsService.searchApartments(
                agentId, status, district, minSquare, maxSquare,
                minRooms, maxRooms, minFloor, maxFloor, minPrice, maxPrice,
                minHouseDate, maxHouseDate, sort);
        return ResponseEntity.ok(apartments);
    }

    @GetMapping("/searchText")
    public ResponseEntity<List<ApartmentsData>> searchByText(String prompt) {
        return ResponseEntity.ok(apartmentsService.searchByPrompt(prompt));
    }

    @GetMapping("/feedback/{id}")
    public ResponseEntity<FeedbackData> getApartmentFeedback(@PathVariable Long id) {
        return ResponseEntity.ok(apartmentsService.getFeedbackById(id));
    }

    @PostMapping("/feedback/add")
    public ResponseEntity<FeedbackData> addApartmentFeedback(@RequestBody FeedbackData feedbackData) {
        return ResponseEntity.ok(apartmentsService.saveFeedBack(feedbackData));
    }
}
