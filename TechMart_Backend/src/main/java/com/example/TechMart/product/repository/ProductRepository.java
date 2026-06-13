package com.example.TechMart.product.repository;

import com.example.TechMart.product.entity.Products;
import com.example.TechMart.user.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Products, Long> {
    List<Products> findByNameContainingIgnoreCase(String keyword);

    @Query("""
    SELECT p
    FROM Products p
    WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
    OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
    """)
    List<Products> searchProducts(String keyword);
}
