package com.example.TechMart.cart.controller;

import com.example.TechMart.cart.dto.CartItemRequest;
import com.example.TechMart.cart.dto.CartItemResponse;
import com.example.TechMart.cart.dto.CartRequest;
import com.example.TechMart.cart.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @PostMapping("/addToCart")
    public String addToCart(@RequestBody CartRequest dto, Authentication authentication){
        return cartService.addToCart(dto, authentication.getName());
    }

    @GetMapping
    public List<CartItemResponse> getCartItems(Authentication authentication){
        return cartService.getCartItems(authentication.getName());
    }

    @PostMapping("/removeCartItem")
    public String removeCartItem(@RequestBody CartItemRequest dto, Authentication authentication){
        System.out.println(dto.getCartItemId());
        System.out.println("DTO = " + dto);
        return cartService.removeCartItem(dto.getCartItemId(), authentication.getName());
    }
}
