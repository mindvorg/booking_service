package com.example.data;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface  ApartmentsRepository extends JpaRepository<ApartmentsData, Long> {

    Optional<ApartmentsData> findByDistrict(String district);

    // Поиск по площади
    List<ApartmentsData> getAllBySquare(Short square);
    List<ApartmentsData> findBySquareGreaterThanEqual(Short minSquare);
    List<ApartmentsData> findBySquareLessThanEqual(Short maxSquare);
    List<ApartmentsData> findBySquareBetween(Short minSquare, Short maxSquare);

    // Поиск по количеству комнат
    List<ApartmentsData> getAllByRoomNumber(Short roomNumber);
    List<ApartmentsData> findByRoomNumberIn(List<Short> roomNumbers);

    // Поиск по этажу
    List<ApartmentsData> getAllByFloor(Short floor);
    List<ApartmentsData> findByFloorGreaterThanEqual(Short minFloor);
    List<ApartmentsData> findByFloorLessThanEqual(Short maxFloor);
    List<ApartmentsData> findByFloorBetween(Short minFloor, Short maxFloor);

    // Поиск по району
    List<ApartmentsData> getAllByDistrict(String district);
    List<ApartmentsData> findByDistrictContainingIgnoreCase(String districtPart);

    // Поиск по статусу
    List<ApartmentsData> getAllByStatus(String status);

    // Поиск по типу квартиры
    List<ApartmentsData> getAllByApartType(String apartType);
    List<ApartmentsData> findByApartTypeIn(List<String> apartTypes);

    // Поиск по агенту
    List<ApartmentsData> getAllByAgentId(Long agentId);


    @Query(value = "SELECT * FROM apartment WHERE status = 'AVAILABLE' AND REPLACE(price, ' ', '')::numeric BETWEEN :minPrice AND :maxPrice", nativeQuery = true)
    List<ApartmentsData> findAvailableByPriceRangeNative(@Param("minPrice") Integer minPrice, @Param("maxPrice") Integer maxPrice);

    @Query("SELECT a FROM ApartmentsData a WHERE " +
            "(:district IS NULL OR LOWER(a.district) LIKE LOWER(CONCAT('%', :district, '%'))) AND " +
            "(:minPrice IS NULL OR a.price >= :minPrice) AND " +
            "(:maxPrice IS NULL OR a.price <= :maxPrice) AND " +
            "(:minRooms IS NULL OR a.roomNumber >= :minRooms) AND " +
            "(:maxRooms IS NULL OR a.roomNumber <= :maxRooms) AND " +
            "(:status IS NULL OR a.status = :status) AND " +
            "(:apartType IS NULL OR a.apartType = :apartType)")
    List<ApartmentsData> findBySearchCriteria(@Param("district") String district,
                                              @Param("minPrice") Integer minPrice,
                                              @Param("maxPrice") Integer maxPrice,
                                              @Param("minRooms") Short minRooms,
                                              @Param("maxRooms") Short maxRooms,
                                              @Param("status") String status,
                                              @Param("apartType") String apartType);
}
