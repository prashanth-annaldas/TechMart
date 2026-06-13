package com.example.TechMart.profile.repository;

import com.example.TechMart.profile.entity.Address;
import com.example.TechMart.user.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProfileRepository extends JpaRepository<Address, Long> {
    List<Address> findByUser(Users user);
}
