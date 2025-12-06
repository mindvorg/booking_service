package com.example.controller;

import com.example.service.PhotoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/photo")
public class PhotoController {


    private final PhotoService photoService;

    @Autowired
    public PhotoController(PhotoService photoService) {
        this.photoService = photoService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<List<String>> uploadPhoto(@RequestParam("files") List<MultipartFile> files) {
        System.err.println(files.getFirst().isEmpty());
        List<String> list;
        try {
            list = photoService.uploadToS3(files);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(List.of("error", "Ошибка при загрузке файлов: " + e.getMessage()));
        }
        return ResponseEntity.ok(list);
    }

    @DeleteMapping("/delete")
    public ResponseEntity<List<String>> deletePhoto(@RequestBody List<String> paths) {
        return ResponseEntity.ok(photoService.deletePhotosFromS3(paths));
    }
}
