package com.example.TechMart.auth.controller;

import com.example.TechMart.auth.dto.AuthResponse;
import com.example.TechMart.auth.dto.CurrentUserResponse;
import com.example.TechMart.auth.dto.LoginRequest;
import com.example.TechMart.auth.dto.RegisterRequest;
import com.example.TechMart.auth.service.AuthService;
import com.example.TechMart.user.entity.Users;
import com.example.TechMart.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepo;

    @PostMapping("/myregister")
    public String register(@RequestBody RegisterRequest dto){
        return authService.register(dto);
    }

    @PostMapping("/mylogin")
    public AuthResponse login(@RequestBody LoginRequest dto, HttpServletResponse res){
        return authService.login(dto, res);
    }

    @GetMapping("/me")
    public CurrentUserResponse currentUser(Authentication authentication){

        if(authentication == null){
            return new CurrentUserResponse(null, null, null);
        }

        String email = authentication.getName();

        String role = authentication
                .getAuthorities()
                .iterator()
                .next()
                .getAuthority();

        Users user = userRepo.findByEmail(email).orElseThrow();

        return new CurrentUserResponse(email, role, user.getName());
    }

    @PostMapping("/mylogout")
    public String logout(HttpServletResponse res){
        return authService.logout(res);
    }
}
