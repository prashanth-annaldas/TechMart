package com.example.TechMart.cart.service;

import com.example.TechMart.cart.dto.CartItemResponse;
import com.example.TechMart.cart.dto.CartRequest;
import com.example.TechMart.cart.entity.Cart;
import com.example.TechMart.cart.entity.CartItem;
import com.example.TechMart.cart.repository.CartItemRepository;
import com.example.TechMart.cart.repository.CartRepository;
import com.example.TechMart.product.entity.Products;
import com.example.TechMart.product.repository.ProductRepository;
import com.example.TechMart.user.entity.Users;
import com.example.TechMart.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class CartService {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private ProductRepository productRepo;

    @Autowired
    private CartRepository cartRepo;

    @Autowired
    private CartItemRepository cartItemRepo;

    public String addToCart(CartRequest dto, String email){

        Users user = userRepo.findByEmail(email).orElseThrow();

        Products products = productRepo.findById(dto.getProductId()).orElseThrow();

        Cart cart = cartRepo.findByUser(user)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    return cartRepo.save(newCart);
                });

        CartItem existingItem =
                cartItemRepo.findByCartAndProducts(cart, products)
                        .orElse(null);

        if(existingItem != null){
            return "ALREADY EXISTS";
        }

        CartItem cartItem = new CartItem();

        cartItem.setCart(cart);
        cartItem.setProducts(products);
        cartItem.setQuantity(dto.getQuantity());

        cartItemRepo.save(cartItem);

        return "ADDED TO CART";
    }

    public List<CartItemResponse> getCartItems(String email){
        Users user = userRepo.findByEmail(email).orElseThrow();

        Cart cart = cartRepo.findByUser(user).orElseThrow();

        if(cart == null){
            return new ArrayList<>();
        }

        List<CartItem> cartItems = cartItemRepo.findByCart(cart);

        List<CartItemResponse> res = new ArrayList<>();

        for(CartItem cartItem : cartItems){
            CartItemResponse dto = new CartItemResponse();

            dto.setCartItemId(cartItem.getId());
            dto.setDescription(cartItem.getProducts().getDescription());
            dto.setImageUrl(cartItem.getProducts().getImageUrl());
            dto.setProductId(cartItem.getProducts().getId());
            dto.setProductName(cartItem.getProducts().getName());

            Double totalAmount = cartItem.getQuantity() * cartItem.getProducts().getPrice();

            dto.setTotalAmount(totalAmount);

            res.add(dto);
        }

        return res;
    }

    public String removeCartItem(Long cartItemId, String email){

        System.out.println("Cart Item Id = " + cartItemId);

        CartItem cartItem = cartItemRepo.findById(cartItemId).orElseThrow();

        cartItemRepo.delete(cartItem);

        return "REMOVED";
    }

}
