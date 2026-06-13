package com.example.TechMart.order.repository;

import com.example.TechMart.order.entity.Orders;
import com.example.TechMart.user.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Orders, Long> {
    List<Orders> findByUser(Users user);
}
