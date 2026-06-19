package com.example.TechMart.order.repository;

import com.example.TechMart.order.entity.Payment;
import com.example.TechMart.user.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);

    List<Payment> findByUser(Users user);
}
