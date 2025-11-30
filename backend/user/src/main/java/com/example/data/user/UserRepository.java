package com.example.data.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<UserData,Long> {

    Optional<UserData> findByEmail(String district);
}
