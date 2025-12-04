package com.example.controller;

import com.example.data.ApartmentsData;
import com.example.service.ApartmentsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

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


    @PostMapping(value = "/photos/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<List<String>> uploadPhoto(@RequestParam("files") List<MultipartFile> files) {
        System.err.println(files.getFirst().isEmpty());
        List<String> list;
        try {
            list = apartmentsService.uploadToS3(files);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(List.of("error", "Ошибка при загрузке файлов: " + e.getMessage()));
        }
        return ResponseEntity.ok(list);
    }

    @DeleteMapping("/photos/delete")
    public ResponseEntity<List<String>> deletePhoto(@RequestBody List<String> paths) {
        return ResponseEntity.ok(apartmentsService.deletePhotosFromS3(paths));
    }
}
