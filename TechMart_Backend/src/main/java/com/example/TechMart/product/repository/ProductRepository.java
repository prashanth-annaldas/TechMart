package com.example.TechMart.product.repository;

import com.example.TechMart.product.entity.Products;
import com.example.TechMart.user.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Products, Long> {

}
