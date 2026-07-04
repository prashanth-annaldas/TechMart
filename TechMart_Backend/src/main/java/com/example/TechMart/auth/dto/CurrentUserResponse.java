package com.example.TechMart.auth.dto;

public class CurrentUserResponse {
    private String email;
    private String role;
    private String name;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public CurrentUserResponse(String email, String role, String name){
        this.email = email;
        this.role = role;
        this.name = name;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
