package com.example.TechMart.reviews.service;

import com.example.TechMart.cart.repository.CartItemRepository;
import com.example.TechMart.cart.repository.CartRepository;
import com.example.TechMart.elasticsearch.document.ProductDocument;
import com.example.TechMart.elasticsearch.repository.ProductSearchRepository;
import com.example.TechMart.product.entity.Products;
import com.example.TechMart.product.repository.ProductRepository;
import com.example.TechMart.reviews.dto.ReviewsRequest;
import com.example.TechMart.reviews.dto.ReviewsResponse;
import com.example.TechMart.reviews.entity.Reviews;
import com.example.TechMart.reviews.repository.ReviewsRepository;
import com.example.TechMart.user.entity.Users;
import com.example.TechMart.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class ReviewsService {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private ProductRepository productRepo;

    @Autowired
    private CartRepository cartRepo;

    @Autowired
    private CartItemRepository cartItemRepo;

    @Autowired
    private ReviewsRepository reviewsRepo;

    @Autowired
    private ProductSearchRepository productSearchRepo;

    public String addRating(ReviewsRequest dto, String email){
        Users user = userRepo.findByEmail(email).orElseThrow();

        Products product = productRepo.findById(dto.getProductId()).orElseThrow();

        Reviews review = new Reviews();

        review.setRating(dto.getRating());
        review.setComment(dto.getComment());
        review.setUser(user);
        review.setProduct(product);
        review.setCreatedAt(LocalDateTime.now());

        reviewsRepo.save(review);

        updateAverageRating(product.getId());

        return "REVIEW SAVED";
    }

    public List<ReviewsResponse> getProductReviews(Long productId){
        Products product = productRepo.findById(productId).orElseThrow();
        List<Reviews> reviews = reviewsRepo.findByProduct(product);
        List<ReviewsResponse> res = new ArrayList<>();

        for(Reviews review : reviews){
            ReviewsResponse dto = new ReviewsResponse();

            dto.setProductId(productId);
            dto.setComment(review.getComment());
            dto.setRating(review.getRating());
            dto.setUserName(review.getUser().getName());

            res.add(dto);
        }

        return res;
    }

    private void updateAverageRating(Long productId) {

        Products product =
                productRepo.findById(productId)
                        .orElseThrow();

        Double avg =
                reviewsRepo.getAverageRating(productId);

        product.setAverageRating(
                avg == null ? 0.0 : avg
        );

        ProductDocument doc = productSearchRepo.findById(product.getId()).orElseThrow();

        Long reviewCount = reviewsRepo.countByProductId(productId);

        if(doc != null){
            doc.setAverageRating(avg);
            doc.setReviewCount(reviewCount);
            productSearchRepo.save(doc);
        }

        productRepo.save(product);
    }
}
