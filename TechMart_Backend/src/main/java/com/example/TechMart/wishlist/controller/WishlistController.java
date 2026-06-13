package com.example.TechMart.wishlist.controller;

import com.example.TechMart.wishlist.dto.WishlistRemoveDTO;
import com.example.TechMart.wishlist.dto.WishlistRequest;
import com.example.TechMart.wishlist.dto.WishlistResponse;
import com.example.TechMart.wishlist.service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;

    @GetMapping("")
    public List<WishlistResponse> getMyWishlistItems(Authentication authentication){
        return wishlistService.getMyWishlistItems(authentication.getName());
    }

    @PostMapping("/add")
    public String addToWishlist(@RequestBody WishlistRequest dto, Authentication authentication){
        return wishlistService.addToWishlist(dto.getProductId(), authentication.getName());
    }

    @PostMapping("/removeItem")
    public String removeItem(@RequestBody WishlistRemoveDTO dto, Authentication authentication){
        return wishlistService.removeItem(dto.getWishlistItemId(), authentication.getName());
    }
}
