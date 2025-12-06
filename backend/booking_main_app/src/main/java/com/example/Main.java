package com.example;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.net.URI;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
public class Main {
    private final S3Client s3Client;

    @Value("${yandex.bucket}")
    private String bucket;

    AwsBasicCredentials credentials;

    public Main( @Value("${yandex.access-key-id}") String accessKeyId,
                 @Value("${yandex.secret-access-key}") String secretAccessKey,
                 @Value("${yandex.region}") String region) {
        credentials = AwsBasicCredentials.create(accessKeyId, secretAccessKey);
        this.s3Client = S3Client.builder()
                .region(Region.of(region))
                .endpointOverride(URI.create("https://storage.yandexcloud.net"))
                .credentialsProvider(StaticCredentialsProvider.create(credentials))
                .build();
    }


    @GetMapping("/hello")
    public String hello(@RequestParam(value = "name", defaultValue = "World") String name) {
        return String.format("Hello %s!", name);
    }
    @GetMapping("/")
    public String anc(){
        return "sss";
    }

    // Загрузка фото и получение ссылки
//    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
//    public ResponseEntity<Map<String, String>> uploadPhoto(@RequestParam("file") MultipartFile file) {
//        try {
//            String originalFileName = file.getOriginalFilename();
//            String fileExtension = getFileExtension(originalFileName);
//            String uniqueFileName = UUID.randomUUID() + "." + fileExtension;
//            String key = "photos/" + uniqueFileName;
//
//            // Загружаем файл в Yandex Cloud
//            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
//                    .bucket(bucket)
//                    .key(key)
//                    .contentType(file.getContentType())
//                    .build();
//
//            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(file.getBytes()));
//
//            // Генерируем публичную ссылку
//            String fileUrl = generatePublicUrl(key);
//
//            Map<String, String> response = new HashMap<>();
//            response.put("message", "Файл успешно загружен");
//            response.put("fileUrl", fileUrl);
//            response.put("fileName", uniqueFileName);
//            response.put("key", key);
//
//            return ResponseEntity.ok(response);
//
//        } catch (IOException e) {
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                    .body(Map.of("error", "Ошибка при загрузке файла: " + e.getMessage()));
//        }
//    }

    // Получение ссылки по имени файла
    @GetMapping("/url/{fileName}")
    public ResponseEntity<Map<String, String>> getFileUrl(@PathVariable String fileName) {
        String key = "photos/" + fileName;
        String fileUrl = generatePublicUrl(key);

        Map<String, String> response = new HashMap<>();
        response.put("fileUrl", fileUrl);
        response.put("fileName", fileName);

        return ResponseEntity.ok(response);
    }

    // Генерация публичного URL
    private String generatePublicUrl(String key) {
        return String.format("https://%s.storage.yandexcloud.net/%s", bucket, key);
    }

    // Получение расширения файла
    private String getFileExtension(String fileName) {
        return fileName != null && fileName.contains(".")
                ? fileName.substring(fileName.lastIndexOf(".") + 1)
                : "jpg";
    }
}