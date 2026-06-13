package com.example.TechMart.order.controller;

import com.example.TechMart.order.dto.BuyNowRequest;
import com.example.TechMart.order.dto.OrderRequest;
import com.example.TechMart.order.dto.OrderResponse;
import com.example.TechMart.order.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping("/orders/buyNow")
    public String buyNow(@RequestBody BuyNowRequest dto, Authentication authentication){
        return orderService.buyNow(dto, authentication.getName());
    }

    @GetMapping("/orders")
    public List<OrderResponse> getUserOrders(Authentication authentication){
        return orderService.getUserOrders(authentication.getName());
    }

    @GetMapping("/admin/orders")
    public List<OrderResponse> getAllUserOrders(Authentication authentication){
        return orderService.getAllUserOrders();
    }

    @PutMapping("/admin/orders/{orderId}/status")
    public String updateStatus(@PathVariable Long orderId, @RequestBody OrderRequest dto){
        return orderService.updateStatus(orderId, dto.getStatus());
    }
}
