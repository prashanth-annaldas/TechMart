package com.example.TechMart.elasticsearch.service;

import com.example.TechMart.elasticsearch.document.ProductDocument;
import com.example.TechMart.elasticsearch.repository.ProductSearchRepository;
import com.example.TechMart.product.entity.Products;
import com.example.TechMart.product.repository.ProductRepository;
import com.example.TechMart.reviews.repository.ReviewsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class ProductSearchService {

    @Autowired
    private ProductSearchRepository productSearchRepo;

    @Autowired
    private ProductRepository productRepo;

    @Autowired
    private ReviewsRepository reviewsRepo;

    public String syncProducts(){
        List<Products> products = productRepo.findAll();

        for(Products product : products){
            ProductDocument doc = new ProductDocument();

            doc.setAverageRating(product.getAverageRating());
            doc.setId(product.getId());
            doc.setName(product.getName());
            doc.setDescription(product.getDescription());
            doc.setPrice(product.getPrice());
            doc.setStock(product.getStock());
            doc.setImageUrl(product.getImageUrl());
            doc.setCategory(product.getCategory().getName());
            doc.setTotalSold(product.getTotalSold());

            Long reviewCount = reviewsRepo.countByProductId(product.getId());
            doc.setReviewCount(reviewCount);

            int sold = (product.getTotalSold() == null) ? 0 : product.getTotalSold();

            double rating = (product.getAverageRating() == null) ? 0 : product.getAverageRating();

            long daysOld = ChronoUnit.DAYS.between(product.getCreatedAt().toLocalDate(), LocalDateTime.now());

            double freshness = Math.max(0, 100 - daysOld);

            double stockScore = Math.min(product.getStock(), 100);

            double salesScore = (rating * 30) + (sold * 2) + stockScore * 0.3 + freshness;

            doc.setSalesScore(salesScore);

            productSearchRepo.save(doc);
        }
        return "INDEXED";
    }

    public List<ProductDocument> searchByName(String name){
        return productSearchRepo.fuzzySearch(name);
    }

    public List<String> suggestions(String name){
        return productSearchRepo
                .findByNameStartingWithIgnoreCase(name)
                .stream()
                .map(ProductDocument::getName)
                .distinct()
                .limit(10)
                .toList();
    }
}
