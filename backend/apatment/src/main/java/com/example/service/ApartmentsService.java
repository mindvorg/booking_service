package com.example.service;

import com.example.data.ApartmentsData;
import com.example.data.ApartmentsRepository;
import com.example.data.agent.AgentData;
import com.example.data.user.UserData;
import com.example.data.user.UserRole;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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

    @Transactional
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ApartmentsData saveApart(ApartmentsData apartmentsData) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserEmail = authentication.getName();
        Optional<UserData> user = userService.findUserByEmail(currentUserEmail);
        if (user.isEmpty()) {
            throw new NoSuchFieldError("User not found with id: " + apartmentsData.getAgentId());
        }
        UserData userData = user.get();
        Optional<AgentData> agent = userService.findAgentByUserId(userData.getId());
        apartmentsData.setAgentId(userData.getId());

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

    @PreAuthorize("isAuthenticated()")
    public List<ApartmentsData> getMyApartments() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserEmail = authentication.getName();

        // Находим пользователя по email
        Optional<UserData> user = userService.findUserByEmail(currentUserEmail);
        if (user.isEmpty()) {
            return new ArrayList<>();
        }

        UserData userData = user.get();

        // Если это агент, возвращаем его квартиры
        if (userData.getRole() == UserRole.AGENT) {
            return apartmentsRepository.getAllByAgentId(userData.getId());
        }

        // Если это обычный пользователь, можно вернуть избранные квартиры
        // Пока возвращаем пустой список
        return new ArrayList<>();
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


    public UserService.AgentInfoDTO getAgentInfoForApartment(Long apartmentId) {
        Optional<ApartmentsData> apartment = apartmentsRepository.findById(apartmentId);
        if (apartment.isPresent()) {
            Long agentId = apartment.get().getAgentId();
            return userService.getAgentInfo(agentId);
        }
        return null;
    }

}
