package com.example.TechMart.auth.service;

import com.example.TechMart.auth.dto.AuthResponse;
import com.example.TechMart.auth.dto.LoginRequest;
import com.example.TechMart.auth.dto.RegisterRequest;
import com.example.TechMart.security.JwtService;
import com.example.TechMart.user.entity.Users;
import com.example.TechMart.user.repository.UserRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private BCryptPasswordEncoder encoder;

    @Autowired
    private JwtService jwtService;

    public String register(RegisterRequest dto){
        if(userRepo.existsByEmail(dto.getEmail())){
            return "USER ALREADY EXISTS";
        }

        Users user = new Users();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPassword(encoder.encode(dto.getPassword()));
        user.setRole(Users.Role.CUSTOMER);

        userRepo.save(user);
        return "REGISTERED";
    }

    public AuthResponse login(LoginRequest dto, HttpServletResponse res){
        Users user = userRepo.findByEmail(dto.getEmail()).orElseThrow();

        System.out.println("EMAIL = " + dto.getEmail());
        System.out.println("PASSWORD = " + dto.getPassword());

        if(user == null){
            return new AuthResponse("USER NOT EXISTED", null);
        }

        if(!encoder.matches(dto.getPassword(), user.getPassword())){
            return new AuthResponse("INCORRECT CREDENTIALS", null);
        }

        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());

        Cookie cookie = new Cookie("jwt", token);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(60 * 60);
        res.addCookie(cookie);
        return new AuthResponse("LOGINNED", user.getRole().name());
    }

    public String logout(HttpServletResponse res){
        Cookie cookie = new Cookie("jwt", "");
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        res.addCookie(cookie);
        SecurityContextHolder.clearContext();
        return "LOGOUT SUCCESSFULL";
    }
}
