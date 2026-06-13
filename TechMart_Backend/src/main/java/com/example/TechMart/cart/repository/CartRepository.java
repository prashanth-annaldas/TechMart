package com.example.TechMart.cart.repository;

import com.example.TechMart.cart.entity.Cart;
import com.example.TechMart.user.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {
    Optional<Cart> findByUser(Users user);
}
