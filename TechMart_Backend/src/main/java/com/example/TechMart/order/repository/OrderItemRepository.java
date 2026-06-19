package com.example.TechMart.order.repository;

import com.example.TechMart.order.entity.OrderItem;
import com.example.TechMart.product.entity.Products;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    @Transactional
    @Modifying
    void deleteByProduct(Products product);

    @Query("""
        SELECT SUM(o.quantity)
        FROM OrderItem o
        WHERE o.product.id = :productId
    """)
    Integer totalOrders(Long productId);
}
