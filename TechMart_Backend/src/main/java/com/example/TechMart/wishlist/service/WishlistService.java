package com.example.TechMart.wishlist.service;

import com.example.TechMart.product.entity.Products;
import com.example.TechMart.product.repository.ProductRepository;
import com.example.TechMart.user.entity.Users;
import com.example.TechMart.user.repository.UserRepository;
import com.example.TechMart.wishlist.dto.WishlistResponse;
import com.example.TechMart.wishlist.entity.Wishlist;
import com.example.TechMart.wishlist.entity.WishlistItem;
import com.example.TechMart.wishlist.repository.WishlistItemRepository;
import com.example.TechMart.wishlist.repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class WishlistService {

    @Autowired
    private WishlistRepository wishlistRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private ProductRepository productRepo;

    @Autowired
    private WishlistItemRepository wishlistItemRepo;

    public String addToWishlist(Long productId, String email){
        Users user = userRepo.findByEmail(email).orElseThrow();

        Products product = productRepo.findById(productId).orElseThrow();

        Wishlist wishlist = wishlistRepo.findByUser(user).orElseGet(() -> {
            Wishlist newWishlist = new Wishlist();
            newWishlist.setUser(user);
            return wishlistRepo.save(newWishlist);
        });
        wishlist.setUser(user);
        wishlistRepo.save(wishlist);

        boolean alreadyExists = wishlistItemRepo
                .findByWishlistAndProduct(wishlist, product)
                .isPresent();

        if (alreadyExists) {
            return "PRODUCT ALREADY IN WISHLIST";
        }

        WishlistItem wishlistItems = new WishlistItem();

        wishlistItems.setWishlist(wishlist);
        wishlistItems.setProduct(product);
        wishlistItemRepo.save(wishlistItems);

        return "PRODUCT SAVED";
    }

    public List<WishlistResponse> getMyWishlistItems(String email){

        Users user = userRepo.findByEmail(email).orElseThrow();

        Wishlist wishlist = wishlistRepo.findByUser(user).orElse(null);

        if(wishlist == null){
            return new ArrayList<>();
        }

        List<WishlistItem> wishlistItems = wishlistItemRepo.findByWishlist(wishlist);

        List<WishlistResponse> res = new ArrayList<>();

        for(WishlistItem wishlistItem : wishlistItems){
            WishlistResponse dto = new WishlistResponse();

            dto.setDescription(wishlistItem.getProduct().getDescription());
            dto.setPrice(wishlistItem.getProduct().getPrice());
            dto.setImageUrl(wishlistItem.getProduct().getImageUrl());
            dto.setProductName(wishlistItem.getProduct().getName());
            dto.setWishlistItemId(wishlistItem.getId());
            dto.setProductId(wishlistItem.getProduct().getId());

            res.add(dto);
        }
        return res;
    }

    public String removeItem(Long wishlistItemId, String email){
        Users user = userRepo.findByEmail(email).orElseThrow();

        Wishlist wishlist = wishlistRepo.findByUser(user).orElse(null);

        WishlistItem wishlistItem = wishlistItemRepo.findById(wishlistItemId).orElseThrow();

        wishlistItemRepo.delete(wishlistItem);

        return "REMOVED";
    }
}
