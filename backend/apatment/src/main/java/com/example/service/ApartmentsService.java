package com.example.service;

import com.example.data.ApartmentsData;
import com.example.data.ApartmentsRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
public class ApartmentsService {

    @Value("${yandex.bucket}")
    private String bucket;
    private final S3Client s3Client;

    private final ApartmentsRepository apartmentsRepository;
    private final UserService userService;

    @Autowired
    public ApartmentsService(@Value("${yandex.access-key-id}") String accessKeyId,
                             @Value("${yandex.secret-access-key}") String secretAccessKey,
                             @Value("${yandex.region}") String region,
                             ApartmentsRepository apartmentsRepository, UserService userService) {
        this.apartmentsRepository = apartmentsRepository;
        this.userService = userService;
        AwsBasicCredentials credentials = AwsBasicCredentials.create(accessKeyId, secretAccessKey);
        this.s3Client = S3Client.builder()
                .region(Region.of(region))
                .endpointOverride(URI.create("https://storage.yandexcloud.net"))
                .credentialsProvider(StaticCredentialsProvider.create(credentials))
                .build();
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

    public List<ApartmentsData> searchApartments(String district, Integer minPrice, Integer maxPrice, Short minRooms, Short maxRooms, String status, String apartType) {
        return apartmentsRepository.findBySearchCriteria(
                district, minPrice, maxPrice, minRooms, maxRooms, status, apartType);
    }

    public List<ApartmentsData> getByDistrict(String district) {
        return apartmentsRepository.getAllByDistrict(district);
    }

    public List<ApartmentsData> getByAgent(Long agent) {
        return apartmentsRepository.getAllByAgentId(agent);
    }

    public List<ApartmentsData> searchByPrompt(String prompt) {
        return apartmentsRepository.findBySearchText(prompt);
    }

//    public List<Map<String, String>> uploadToS3(List<MultipartFile> files) throws IOException {//переписать только чтоб ссылка возвращалась
//
//        List<Map<String, String>> uploadedFiles = new ArrayList<>();
//
//        for (MultipartFile file : files) {
//            if (!file.isEmpty()) {
//                String originalFileName = file.getOriginalFilename();
//                String fileExtension = getFileExtension(originalFileName);
//                String uniqueFileName = UUID.randomUUID() + "." + fileExtension;
//                String key = "photos/" + uniqueFileName;
//
//                PutObjectRequest putObjectRequest = PutObjectRequest.builder()
//                        .bucket(bucket)
//                        .key(key)
//                        .contentType(file.getContentType())
//                        .build();
//
//                s3Client.putObject(putObjectRequest, software.amazon.awssdk.core.sync.RequestBody.fromBytes(file.getBytes()));
//
//                String fileUrl = generatePublicUrl(key);
//
//                Map<String, String> fileInfo = new HashMap<>();
//                fileInfo.put("originalName", originalFileName);
//                fileInfo.put("fileName", uniqueFileName);
//                fileInfo.put("fileUrl", fileUrl);
//                fileInfo.put("key", key);
//                fileInfo.put("size", String.valueOf(file.getSize()));
//
//                uploadedFiles.add(fileInfo);
//            }
//        }
//        return uploadedFiles;
//    }
    public List< String> uploadToS3(List<MultipartFile> files) throws IOException {//переписать только чтоб ссылка возвращалась

        List<String> uploadedFiles = new ArrayList<>();

        for (MultipartFile file : files) {
            if (!file.isEmpty()) {
                String originalFileName = file.getOriginalFilename();
                String fileExtension = getFileExtension(originalFileName);
                String uniqueFileName = UUID.randomUUID() + "." + fileExtension;
                String key = "photos/" + uniqueFileName;

                PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                        .bucket(bucket)
                        .key(key)
                        .contentType(file.getContentType())
                        .build();

                s3Client.putObject(putObjectRequest, software.amazon.awssdk.core.sync.RequestBody.fromBytes(file.getBytes()));

                String fileUrl = generatePublicUrl(key);

                uploadedFiles.add(uniqueFileName);
            }
        }
        return uploadedFiles;
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

    public List<String> deletePhotosFromS3(List<String> fileNames) {
        List<String> result = new ArrayList<>();

        if (fileNames == null || fileNames.isEmpty()) {
            return result;
        }

        for (String fileName : fileNames) {
            if (fileName == null || fileName.trim().isEmpty()) {
                result.add("");
                continue;
            }

            try {
                String key = "photos/" + fileName;

                s3Client.deleteObject(builder -> builder
                        .bucket(bucket)
                        .key(key));

                result.add("");
                log.info("Successfully deleted file: {}", fileName);

            } catch (software.amazon.awssdk.services.s3.model.NoSuchKeyException e) {
                result.add("");
                log.warn("File not found, already deleted: {}", fileName);
            } catch (Exception e) {
                result.add(fileName);
                log.error("Error deleting file from S3: {}. Error: {}", fileName, e.getMessage());
            }
        }

        return result;
    }


}
