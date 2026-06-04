package com.example.TechMart.product.controller;

import com.example.TechMart.product.dto.ProductRequest;
import com.example.TechMart.product.entity.Products;
import com.example.TechMart.product.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ProductController {

    @Autowired
    private ProductService productService;

    @PostMapping("/admin/products")
    public Products createProduct(
            @RequestBody ProductRequest dto
            ){
        return productService.createProduct(dto);
    }

    @GetMapping("/products")
    public List<Products> getAllProducts(){
        return productService.getAllProducts();
    }
}
