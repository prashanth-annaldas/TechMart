package com.example.TechMart.reviews.repository;

import com.example.TechMart.product.entity.Products;
import com.example.TechMart.reviews.entity.Reviews;
import com.example.TechMart.user.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReviewsRepository extends JpaRepository<Reviews, Long> {
    Optional<Reviews> findByUser(Users user);

    List<Reviews> findByProduct(Products product);
    @Query("""
        SELECT AVG(r.rating)
        FROM Reviews r
        WHERE r.product.id = :productId
    """)
    Double getAverageRating(@Param("productId") Long productId);
    Long countByProductId(Long productId);
}
