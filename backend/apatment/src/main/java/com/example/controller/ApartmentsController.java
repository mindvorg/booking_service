package com.example.controller;

import com.example.data.ApartmentsData;
import com.example.service.ApartmentsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.net.URI;
import java.util.*;

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
    public ResponseEntity<List<Map<String, String>>> uploadPhoto(@RequestParam("files") List<MultipartFile> files) {
        List<Map<String,String>> list;
        try {
            list = apartmentsService.uploadToS3(files);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(List.of(Map.of("error", "Ошибка при загрузке файлов: " + e.getMessage())));
        }
        return ResponseEntity.ok(list);
    }

}
