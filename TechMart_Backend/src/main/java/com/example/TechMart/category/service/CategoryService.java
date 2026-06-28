package com.example.TechMart.category.service;

import com.example.TechMart.category.dto.CategoryRequest;
import com.example.TechMart.category.entity.Category;
import com.example.TechMart.category.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepo;

    @CacheEvict(value = "categories", allEntries = true)
    public String createCategory(CategoryRequest dto){

        if(categoryRepo.existsByName(dto.getName())){
            return "CATEGORY ALREADY EXISTS";
        }

        Category category = new Category();

        category.setName(dto.getName());
        category.setDescription(dto.getDescription());

        categoryRepo.save(category);

        return "CATEGORY CREATED";
    }

    @Cacheable(value = "categories")
    public List<Category> getAllCategories(){
        return categoryRepo.findAll();
    }
}
