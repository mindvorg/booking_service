package com.example.data;

import lombok.Data;

@Data
public class UserDTO {
    private String email;
    private String password;
    private String name;
    private String role;
    private String companyName;  // null если не передан
    private String avatar;       // null если не передан
}
