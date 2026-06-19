package com.example.TechMart.product.controller;

import com.example.TechMart.product.dto.ProductRequest;
import com.example.TechMart.product.dto.ProductResponse;
import com.example.TechMart.product.entity.Products;
import com.example.TechMart.product.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

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
    public List<ProductResponse> getAllProducts(){
        return productService.getAllProducts();
    }

    @PutMapping("/admin/editProduct/{productId}")
    public String editProduct(@PathVariable Long productId, @RequestBody ProductRequest dto){
        return productService.editProduct(productId, dto);
    }

    @DeleteMapping("/admin/removeProduct/{productId}")
    public String deleteProduct(@PathVariable Long productId, Authentication authentication){
        System.out.println(authentication.getAuthorities());
        return productService.removeProduct(productId);
    }

    @PostMapping("/admin/products/bulk")
    public List<Products> addProducts(
            @RequestBody List<ProductRequest> products) {

        return productService.addProducts(products);
    }
}
