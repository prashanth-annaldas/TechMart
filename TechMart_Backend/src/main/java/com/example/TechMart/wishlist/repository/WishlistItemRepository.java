package com.example.TechMart.wishlist.repository;

import com.example.TechMart.product.entity.Products;
import com.example.TechMart.wishlist.entity.Wishlist;
import com.example.TechMart.wishlist.entity.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {
    List<WishlistItem> findByWishlist(Wishlist wishlist);

    Optional<WishlistItem>
    findByWishlistAndProduct(
            Wishlist wishlist,
            Products product
    );

    @Transactional
    @Modifying
    void deleteByProduct(Products product);
}
