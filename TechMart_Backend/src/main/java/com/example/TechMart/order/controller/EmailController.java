package com.example.TechMart.order.controller;

import com.example.TechMart.order.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class EmailController {

    @Autowired
    private EmailService emailService;
}
