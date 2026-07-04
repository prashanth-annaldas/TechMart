package com.example.TechMart.ai.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class SearchIntent {

    private String category;
    private String brand;
    private Integer budget;
    private List<String> keywords;

    private String purpose;
    private String sort;

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public Integer getBudget() {
        return budget;
    }

    public void setBudget(Integer budget) {
        this.budget = budget;
    }

    public List<String> getKeywords() {
        return keywords;
    }

    public void setKeywords(List<String> keywords) {
        this.keywords = keywords;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public String getSort() {
        return sort;
    }

    public void setSort(String sort) {
        this.sort = sort;
    }

    @Override
    public String toString() {
        return "SearchIntent{" +
                "category='" + category + '\'' +
                ", brand='" + brand + '\'' +
                ", budget=" + budget +
                ", keywords=" + keywords +
                ", purpose='" + purpose + '\'' +
                ", sort='" + sort + '\'' +
                '}';
    }
}
