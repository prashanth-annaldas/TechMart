package com.example.TechMart.auth.dto;

public class AuthResponse {
    private String message;
    private String role;

    public AuthResponse(String message, String role){
        this.message = message;
        this.role = role;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
