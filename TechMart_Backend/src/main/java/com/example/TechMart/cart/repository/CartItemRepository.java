package com.example.TechMart.cart.repository;

import com.example.TechMart.cart.entity.Cart;
import com.example.TechMart.cart.entity.CartItem;
import com.example.TechMart.product.entity.Products;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByCart(Cart cart);

    Optional<CartItem> findByCartAndProducts(
            Cart cart,
            Products products
    );

    @Modifying
    void deleteByProducts(Products products);
}
