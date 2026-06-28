package com.example.TechMart.elasticsearch.controller;

import com.example.TechMart.elasticsearch.document.ProductDocument;
import com.example.TechMart.elasticsearch.service.ProductSearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ProductSearchController {

    @Autowired
    private ProductSearchService productSearchService;

    @PostMapping("/admin/reindex")
    public String reindex() {
        productSearchService.syncProducts();
        return "DONE";
    }

    @PostMapping("/admin/sync-products")
    public String syncProducts(){
        return productSearchService.syncProducts();
    }

    @GetMapping("/products/search")
    public List<ProductDocument> elasticSearch(@RequestParam String name){
        return productSearchService.elasticSearch(name);
    }

    @GetMapping("/products/suggestions")
    public List<String> suggestions(@RequestParam String name){
        return productSearchService.suggestions(name);
    }
}
