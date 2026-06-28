package com.example.TechMart.product.service;

import com.example.TechMart.cart.repository.CartItemRepository;
import com.example.TechMart.category.entity.Category;
import com.example.TechMart.category.repository.CategoryRepository;
import com.example.TechMart.elasticsearch.repository.ProductSearchRepository;
import com.example.TechMart.elasticsearch.service.ProductSearchService;
import com.example.TechMart.order.repository.OrderItemRepository;
import com.example.TechMart.product.dto.ProductRequest;
import com.example.TechMart.product.dto.ProductResponse;
import com.example.TechMart.product.entity.Products;
import com.example.TechMart.product.repository.ProductRepository;
import com.example.TechMart.reviews.repository.ReviewsRepository;
import com.example.TechMart.user.repository.UserRepository;
import com.example.TechMart.wishlist.repository.WishlistItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ImageUploadService imageUploadService;

    @Autowired
    private CategoryRepository categoryRepo;

    @Autowired
    private ProductRepository productRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private WishlistItemRepository wishlistItemRepo;

    @Autowired
    private OrderItemRepository orderItemRepo;

    @Autowired
    private CartItemRepository cartItemRepo;

    @Autowired
    private ReviewsRepository reviewsRepo;

    @Autowired
    private ProductSearchRepository productSearchRepo;

    @Autowired
    private ProductSearchService productSearchService;

    @Caching(evict = {
            @CacheEvict(value = "products", allEntries = true),
            @CacheEvict(value = "search", allEntries = true),
            @CacheEvict(value = "suggestions", allEntries = true)
    })
    public Products createProduct(ProductRequest dto) {

        String cloudinaryUrl =
                imageUploadService.uploadImageFromUrl(
                        dto.getImageUrl()
                );

        Category category = categoryRepo
                .findById(dto.getCategoryId())
                .orElseThrow(() ->
                        new RuntimeException("Category not found"));

        Products product = new Products();

        product.setName(dto.getName());
        product.setPrice(dto.getPrice());
        product.setStock(dto.getStock());
        product.setDescription(dto.getDescription());
        product.setCategory(category);
        product.setImageUrl(cloudinaryUrl);
        product.setCreatedAt(LocalDateTime.now());

        Products saved = productRepo.save(product);

        productSearchService.updateProductDocument(saved.getId());

        return saved;
    }

    @Cacheable(value = "products")
    public List<ProductResponse> getAllProducts(){

        System.out.println("ACTUALLY HITTING DATABASE");

        List<Products> products = productRepo.findAll();

        List<ProductResponse> response = new ArrayList<>();

        for(Products product : products){

            ProductResponse dto = new ProductResponse();

            dto.setId(product.getId());
            dto.setName(product.getName());
            dto.setPrice(product.getPrice());
            dto.setImageUrl(product.getImageUrl());
            dto.setDescription(product.getDescription());

            Double avg =
                    reviewsRepo.getAverageRating(product.getId());

            Long reviewCount = reviewsRepo.countByProductId(product.getId());

            dto.setAverageRating(
                    avg == null ? 0.0 : avg
            );
            dto.setStock(product.getStock());
            dto.setReviewCount(reviewCount);
            dto.setCategoryId(product.getCategory().getId());
            dto.setCategoryName(product.getCategory().getName());

            response.add(dto);
        }

        return response;
    }

    @Caching(evict = {
            @CacheEvict(value = "products", allEntries = true),
            @CacheEvict(value = "productDetails", key = "#productId"),
            @CacheEvict(value = "search", allEntries = true),
            @CacheEvict(value = "suggestions", allEntries = true)
    })
    public String editProduct(Long productId, ProductRequest dto){

        String cloudinaryUrl =
                imageUploadService.uploadImageFromUrl(
                        dto.getImageUrl()
                );

        Category category = categoryRepo
                .findById(dto.getCategoryId())
                .orElseThrow(() ->
                        new RuntimeException("Category not found"));

        Products product = productRepo
                .findById(productId)
                .orElseThrow(() ->
                        new RuntimeException("Product not found"));

        product.setName(dto.getName());
        product.setPrice(dto.getPrice());
        product.setStock(dto.getStock());
        product.setDescription(dto.getDescription());
        product.setCategory(category);
        product.setImageUrl(cloudinaryUrl);

        productRepo.save(product);

        productSearchService.updateProductDocument(
            product.getId()
        );

        return "PRODUCT EDITED";
    }

    @Caching(evict = {
            @CacheEvict(value = "products", allEntries = true),
            @CacheEvict(value = "productDetails", key = "#productId"),
            @CacheEvict(value = "search", allEntries = true),
            @CacheEvict(value = "suggestions", allEntries = true)
    })
    public String removeProduct(Long productId){
        Products product = productRepo.findById(productId).orElseThrow();

        wishlistItemRepo.deleteByProduct(product);
        orderItemRepo.deleteByProduct(product);
        cartItemRepo.deleteByProducts(product);
        productRepo.delete(product);

        return "DELETED PRODUCT";
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "products", allEntries = true),
            @CacheEvict(value = "productDetails", allEntries = true),
            @CacheEvict(value = "search", allEntries = true),
            @CacheEvict(value = "suggestions", allEntries = true)
    })
    public List<Products> addProducts(List<ProductRequest> requests) {

        List<Products> products = new ArrayList<>();

        for(ProductRequest request : requests){

            Category category = categoryRepo.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));

            String cloudinaryUrl =
                    imageUploadService.uploadImageFromUrl(
                            request.getImageUrl()
                    );

            Products product = new Products();

            product.setName(request.getName());
            product.setPrice(request.getPrice());
            product.setDescription(request.getDescription());
            product.setImageUrl(cloudinaryUrl);
            product.setStock(request.getStock());
            product.setCategory(category);
            product.setCreatedAt(LocalDateTime.now());

            products.add(product);
        }

        List<Products> savedProducts =
                productRepo.saveAll(products);

        for(Products product : savedProducts){
            productSearchService.updateProductDocument(
                    product.getId()
            );
        }

        return savedProducts;
    }

    @Cacheable(
            value = "productDetails",
            key = "#id"
    )
    public ProductResponse getProductById(Long id){
        Products product = productRepo.findById(id)
                .orElseThrow();

        System.out.println("ACTUALLY HITTING DATABASE");

        ProductResponse dto = new ProductResponse();

        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setPrice(product.getPrice());
        dto.setImageUrl(product.getImageUrl());
        dto.setDescription(product.getDescription());
        dto.setStock(product.getStock());

        dto.setCategoryId(product.getCategory().getId());
        dto.setCategoryName(product.getCategory().getName());

        Double avg = reviewsRepo.getAverageRating(product.getId());
        Long reviewCount = reviewsRepo.countByProductId(product.getId());

        dto.setAverageRating(avg == null ? 0.0 : avg);
        dto.setReviewCount(reviewCount);

        return dto;
    }
}