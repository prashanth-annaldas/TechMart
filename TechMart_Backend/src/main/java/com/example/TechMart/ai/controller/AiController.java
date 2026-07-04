package com.example.TechMart.ai.controller;

import com.example.TechMart.ai.dto.AiInputRequest;
import com.example.TechMart.ai.dto.AiRequest;
import com.example.TechMart.ai.service.AiService;
import com.example.TechMart.product.repository.ProductRepository;
import com.example.TechMart.reviews.repository.ReviewsRepository;
import com.example.TechMart.reviews.service.ReviewsService;
import com.example.TechMart.user.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    @Autowired
    private ReviewsRepository reviewsRepo;

    @Autowired
    private ProductRepository productRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private ReviewsService reviewsService;

    @Autowired
    private AiService aiService;
}
