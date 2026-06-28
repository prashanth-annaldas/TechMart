package com.example.TechMart.ai.dto;

public class AiMessage {
    private String role;
    private String content;

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public AiMessage() {}

    public AiMessage(String role, String content) {
        this.role = role;
        this.content = content;
    }
}
