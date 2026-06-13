package com.example.TechMart.product.service;

import com.example.TechMart.cart.repository.CartItemRepository;
import com.example.TechMart.category.entity.Category;
import com.example.TechMart.category.repository.CategoryRepository;
import com.example.TechMart.order.repository.OrderItemRepository;
import com.example.TechMart.product.dto.ProductRequest;
import com.example.TechMart.product.entity.Products;
import com.example.TechMart.product.repository.ProductRepository;
import com.example.TechMart.user.repository.UserRepository;
import com.example.TechMart.wishlist.repository.WishlistItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

        return productRepo.save(product);
    }

    public List<Products> getAllProducts() {
        return productRepo.findAll();
    }

    public Products getProductById(Long id) {
        return productRepo.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Product not found"));
    }

    public void deleteProduct(Long id) {
        productRepo.deleteById(id);
    }

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

        return "PRODUCT EDITED";
    }

    @Transactional
    public String removeProduct(Long productId){
        Products product = productRepo.findById(productId).orElseThrow();

        wishlistItemRepo.deleteByProduct(product);
        orderItemRepo.deleteByProduct(product);
        cartItemRepo.deleteByProducts(product);
        productRepo.delete(product);

        return "DELETED PRODUCT";
    }

    @Transactional
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

            products.add(product);
        }

        return productRepo.saveAll(products);
    }
}