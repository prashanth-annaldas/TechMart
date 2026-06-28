package com.example.TechMart.elasticsearch.service;

import com.example.TechMart.elasticsearch.document.ProductDocument;
import com.example.TechMart.elasticsearch.repository.ProductSearchRepository;
import com.example.TechMart.product.entity.Products;
import com.example.TechMart.product.repository.ProductRepository;
import com.example.TechMart.reviews.repository.ReviewsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.Cacheable;
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

    @Autowired
    private CacheManager cacheManager;

    public void clearSearchCache(){

        Cache search = cacheManager.getCache("search");
        if (search != null) {
            search.clear();
        }

        Cache suggestions = cacheManager.getCache("suggestions");
        if (suggestions != null) {
            suggestions.clear();
        }

        Cache products = cacheManager.getCache("products");
        if (products != null) {
            products.clear();
        }

        Cache productDetails = cacheManager.getCache("productDetails");
        if (productDetails != null) {
            productDetails.clear();
        }
    }

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

            Integer sold = (product.getTotalSold() == null) ? 0 : product.getTotalSold();

            double salesScore = calculateSalesScore(product.getAverageRating(), sold, product.getStock(), reviewCount, product.getCreatedAt());

            doc.setSalesScore(salesScore);

            productSearchRepo.save(doc);
        }
        return "INDEXED";
    }

    @Cacheable(value = "search", key = "#name.toLowerCase()")
    public List<ProductDocument> elasticSearch(String name){
        return productSearchRepo.elasticSearch(name);
    }

    public List<ProductDocument> elasticSearchForAi(String name){
        return productSearchRepo
                .elasticSearch(name)
                .stream()
                .limit(8)
                .toList();
    }

    @Cacheable(value = "suggestions", key = "#name.toLowerCase()")
    public List<String> suggestions(String name){
        return productSearchRepo
                .findByNameStartingWithIgnoreCase(name)
                .stream()
                .map(ProductDocument::getName)
                .distinct()
                .limit(10)
                .toList();
    }

    public double calculateSalesScore(
            Double rating,
            Integer sold,
            Integer stock,
            Long reviewCount,
            LocalDateTime createdAt
    ){

        rating = rating == null ? 0.0 : rating;
        sold = sold == null ? 0 : sold;
        stock = stock == null ? 0 : stock;
        reviewCount = reviewCount == null ? 0 : reviewCount;

        long daysOld =
                ChronoUnit.DAYS.between(
                        createdAt,
                        LocalDateTime.now()
                );

        double freshness =
                Math.max(0, 100 - daysOld);

        double stockScore =
                Math.min(stock, 100);

        double reviewScore =
                reviewCount * 0.5;

        return
                (rating * 30)
                        + (sold * 2)
                        + (stockScore * 0.3)
                        + freshness
                        + reviewScore;
    }

    public void updateProductDocument(Long productId){

        Products product =
                productRepo.findById(productId)
                        .orElseThrow();

        ProductDocument doc =
                productSearchRepo
                        .findById(productId)
                        .orElse(new ProductDocument());

        doc.setId(product.getId());
        doc.setName(product.getName());
        doc.setDescription(product.getDescription());
        doc.setPrice(product.getPrice());
        doc.setImageUrl(product.getImageUrl());
        doc.setCategory(product.getCategory().getName());
        doc.setStock(product.getStock());
        doc.setAverageRating(product.getAverageRating());
        doc.setTotalSold(product.getTotalSold());

        Long reviewCount =
                reviewsRepo.countByProductId(productId);

        doc.setReviewCount(reviewCount);

        Integer sold =
                product.getTotalSold() == null
                        ? 0
                        : product.getTotalSold();

        double salesScore =
                calculateSalesScore(
                        product.getAverageRating(),
                        sold,
                        product.getStock(),
                        reviewCount,
                        product.getCreatedAt()
                );

        doc.setSalesScore(salesScore);

        productSearchRepo.save(doc);

        clearSearchCache();
    }
}
