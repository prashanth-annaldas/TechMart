package com.example.TechMart.reviews.controller;

import com.example.TechMart.product.repository.ProductRepository;
import com.example.TechMart.reviews.dto.ReviewsRequest;
import com.example.TechMart.reviews.dto.ReviewsResponse;
import com.example.TechMart.reviews.repository.ReviewsRepository;
import com.example.TechMart.reviews.service.ReviewsService;
import com.example.TechMart.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ReviewsController {

    @Autowired
    private ReviewsRepository reviewsRepo;

    @Autowired
    private ProductRepository productRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private ReviewsService reviewsService;

    @PostMapping("/reviews/add")
    public String addRating(@RequestBody ReviewsRequest dto, Authentication authentication){
        return reviewsService.addRating(dto, authentication.getName());
    }

    @GetMapping("/products/reviews/{productId}")
    public List<ReviewsResponse> getProductReviews(@PathVariable Long productId){
        return reviewsService.getProductReviews(productId);
    }
}
