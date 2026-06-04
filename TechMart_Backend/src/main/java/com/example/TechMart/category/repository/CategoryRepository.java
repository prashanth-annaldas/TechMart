package com.example.TechMart.category.repository;

import com.example.TechMart.category.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    boolean existsByName(String email);
}
