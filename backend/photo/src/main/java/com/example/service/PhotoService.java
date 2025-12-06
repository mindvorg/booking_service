package com.example.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectResponse;

import java.io.IOException;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class PhotoService {

    @Value("${yandex.bucket}")
    private String bucket;
    private final S3Client s3Client;

    @Autowired
    public PhotoService(@Value("${yandex.access-key-id}") String accessKeyId,
                        @Value("${yandex.secret-access-key}") String secretAccessKey,
                        @Value("${yandex.region}") String region) {

        AwsBasicCredentials credentials = AwsBasicCredentials.create(accessKeyId, secretAccessKey);
        this.s3Client = S3Client.builder()
                .region(Region.of(region))
                .endpointOverride(URI.create("https://storage.yandexcloud.net"))
                .credentialsProvider(StaticCredentialsProvider.create(credentials))
                .build();
    }

    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public List<String> uploadToS3(List<MultipartFile> files) throws IOException {//переписать только чтоб ссылка возвращалась

        List<String> uploadedFiles = new ArrayList<>();

        for (MultipartFile file : files) {
            if (!file.isEmpty()) {


                String originalFileName = file.getOriginalFilename();
                log.debug("originalFileName" + originalFileName);
                String fileExtension = getFileExtension(originalFileName);
                log.debug("fileExtension" + fileExtension);
                String uniqueFileName = UUID.randomUUID() + "." + fileExtension;
                log.debug("uniqueFileName" + uniqueFileName);
                String key = "photos/" + uniqueFileName;
                log.debug("key" + key);
                PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                        .bucket(bucket)
                        .key(key)
                        .contentType(file.getContentType())
                        .build();

                PutObjectResponse a = s3Client.putObject(putObjectRequest, RequestBody.fromBytes(file.getBytes()));
                log.debug("status" + a.eTag());
                String fileUrl = generatePublicUrl(key);

                uploadedFiles.add(fileUrl);
            }
        }
        return uploadedFiles;
    }

    private String generatePublicUrl(String key) {
        return String.format("https://%s.storage.yandexcloud.net/%s", bucket, key);
    }

    // Получение расширения файла
    private String getFileExtension(String fileName) {
        return fileName != null && fileName.contains(".")
                ? fileName.substring(fileName.lastIndexOf(".") + 1)
                : "jpg";
    }

    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
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
