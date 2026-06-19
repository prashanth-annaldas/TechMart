package com.example.TechMart.order.controller;

import com.example.TechMart.order.dto.BuyNowRequest;
import com.example.TechMart.order.dto.RazorpayOrderResponse;
import com.example.TechMart.order.dto.VerifyPaymentRequest;
import com.example.TechMart.order.entity.Orders;
import com.example.TechMart.order.entity.Payment;
import com.example.TechMart.order.repository.PaymentHistoryResponse;
import com.example.TechMart.order.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;
    @PostMapping("/buy-now/create-order")
    public RazorpayOrderResponse createOrder(@RequestBody BuyNowRequest dto, Authentication authentication){
        return paymentService.createOrder(dto, authentication.getName());
    }

    @PostMapping("/buy-now/verify")
    public String verifyPayment(@RequestBody VerifyPaymentRequest dto, Authentication authentication) throws Exception{
        paymentService.verifyPayment(dto, authentication.getName());

        return "PAYMENT SUCCESS";
    }

    @GetMapping("/history")
    public List<PaymentHistoryResponse> getOrdersHistory(Authentication authentication){
        return paymentService.getOrdersHistory(authentication.getName());
    }
}
