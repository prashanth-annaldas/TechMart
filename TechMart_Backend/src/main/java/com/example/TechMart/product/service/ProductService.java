package com.example.TechMart.product.service;

import com.example.TechMart.category.dto.CategoryRequest;
import com.example.TechMart.category.entity.Category;
import com.example.TechMart.category.repository.CategoryRepository;
import com.example.TechMart.product.dto.ProductRequest;
import com.example.TechMart.product.entity.Products;
import com.example.TechMart.product.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ImageUploadService imageUploadService;

    @Autowired
    private CategoryRepository categoryRepo;

    @Autowired
    private ProductRepository productRepo;

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
        System.out.println(dto.getStock());
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
}