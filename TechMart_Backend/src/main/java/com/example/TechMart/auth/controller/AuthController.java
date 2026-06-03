package com.example.TechMart.auth.controller;

import com.example.TechMart.auth.dto.AuthResponse;
import com.example.TechMart.auth.dto.LoginRequest;
import com.example.TechMart.auth.dto.RegisterRequest;
import com.example.TechMart.auth.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/myregister")
    public String register(@RequestBody RegisterRequest dto){
        return authService.register(dto);
    }

    @PostMapping("/mylogin")
    public AuthResponse login(@RequestBody LoginRequest dto, HttpServletResponse res){
        return authService.login(dto, res);
    }
}
