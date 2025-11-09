package com.example.data;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "apartment")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApartmentsData {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String status;

    private String address;

    private Short houseDate;

    private Short floor;

    private Short square;

    private Short roomNumber;

    private Integer price;

    private Long agentId;

    private String photo;

    private String description;

    private String district;

    private String apartType;

    private String geotag;
}
