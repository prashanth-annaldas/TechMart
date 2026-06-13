package com.example.TechMart.wishlist.repository;

import com.example.TechMart.user.entity.Users;
import com.example.TechMart.wishlist.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    Optional<Wishlist> findByUser(Users user);
}
