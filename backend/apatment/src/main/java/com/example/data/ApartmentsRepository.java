package com.example.data;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ApartmentsRepository extends JpaRepository<ApartmentsData, Long> {

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
    List<ApartmentsData> getAllByStatus(Short status);

    // Поиск по типу квартиры
    List<ApartmentsData> getAllByApartType(String apartType);

    List<ApartmentsData> findByApartTypeIn(List<String> apartTypes);

    // Поиск по агенту
    List<ApartmentsData> getAllByAgentId(Long agentId);


    @Query(value = "SELECT * FROM apartment WHERE status = 'AVAILABLE' AND REPLACE(price, ' ', '')::numeric BETWEEN :minPrice AND :maxPrice", nativeQuery = true)
    List<ApartmentsData> findAvailableByPriceRangeNative(@Param("minPrice") Integer minPrice, @Param("maxPrice") Integer maxPrice);


    @Query(value = "SELECT * FROM apartment a WHERE " +
            "(:agentId IS NULL OR a.agent_id = :agentId) AND " +
            "(:status IS NULL OR a.status = :status) AND " +
            "(:district IS NULL OR a.district LIKE '%' || :district || '%') AND " +
            "(:minSquare IS NULL OR a.square >= :minSquare) AND " +
            "(:maxSquare IS NULL OR a.square <= :maxSquare) AND " +
            "(:minRooms IS NULL OR a.room_number >= :minRooms) AND " +
            "(:maxRooms IS NULL OR a.room_number <= :maxRooms) AND " +
            "(:minFloor IS NULL OR a.floor >= :minFloor) AND " +
            "(:maxFloor IS NULL OR a.floor <= :maxFloor) AND " +
            "(:minPrice IS NULL OR a.price >= :minPrice) AND " +
            "(:maxPrice IS NULL OR a.price <= :maxPrice) AND " +
            "(:minHouseDate IS NULL OR a.house_date >= :minHouseDate) AND " +
            "(:maxHouseDate IS NULL OR a.house_date <= :maxHouseDate)"+
            "ORDER BY CASE WHEN :sortPrice = 'DESC' THEN a.price END DESC, " +
            "CASE WHEN :sortPrice != 'DESC' THEN a.price END ASC",
            nativeQuery = true)
    List<ApartmentsData> findBySearchCriteria(
            @Param("agentId") Long agentId,
            @Param("status") Short status,
            @Param("district") String district,
            @Param("minSquare") Integer minSquare,
            @Param("maxSquare") Integer maxSquare,
            @Param("minRooms") Short minRooms,
            @Param("maxRooms") Short maxRooms,
            @Param("minFloor") Short minFloor,
            @Param("maxFloor") Short maxFloor,
            @Param("minPrice") Integer minPrice,
            @Param("maxPrice") Integer maxPrice,
            @Param("minHouseDate") Integer minHouseDate,
            @Param("maxHouseDate") Integer maxHouseDate,
            @Param("sortPrice") String sortPrice);


//    @Query("SELECT a FROM ApartmentsData a WHERE " +
//            "LOWER(a.address) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
//            "LOWER(a.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
//            "LOWER(a.district) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
//            "LOWER(a.apartType) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
//            "LOWER(a.status) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
//            "CAST(a.price AS string) LIKE CONCAT('%', :query, '%') OR " +
//            "CAST(a.houseDate AS string) LIKE CONCAT('%', :query, '%') OR " +
//            "CAST(a.roomNumber AS string) LIKE CONCAT('%', :query, '%') OR " +
//            "CAST(a.floor AS string) LIKE CONCAT('%', :query, '%') OR " +
//            "CAST(a.square AS string) LIKE CONCAT('%', :query, '%')")
//    List<ApartmentsData> findBySearchText(@Param("query") String query);
}
