package com.example.TechMart.category.controller;

import com.example.TechMart.category.dto.CategoryRequest;
import com.example.TechMart.category.entity.Category;
import com.example.TechMart.category.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @PostMapping("/admin/categories")
    public String createCategory(@RequestBody CategoryRequest dto){
        return categoryService.createCategory(dto);
    }

    @GetMapping("/categories")
    public List<Category> getCategories(){
        return categoryService.getAllCategories();
    }
}
