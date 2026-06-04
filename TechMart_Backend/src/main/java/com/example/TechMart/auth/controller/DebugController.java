package com.example.TechMart.auth.controller;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DebugController {

    @GetMapping("/api/auth/debug")
    public String debug() {

        Authentication auth =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        return auth.toString();
    }
}