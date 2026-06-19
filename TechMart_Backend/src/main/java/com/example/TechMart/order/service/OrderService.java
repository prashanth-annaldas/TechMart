package com.example.TechMart.order.service;

import com.example.TechMart.elasticsearch.document.ProductDocument;
import com.example.TechMart.elasticsearch.repository.ProductSearchRepository;
import com.example.TechMart.order.dto.BuyNowRequest;
import com.example.TechMart.order.dto.OrderResponse;
import com.example.TechMart.order.entity.OrderItem;
import com.example.TechMart.order.entity.Orders;
import com.example.TechMart.order.repository.OrderItemRepository;
import com.example.TechMart.order.repository.OrderRepository;
import com.example.TechMart.product.entity.Products;
import com.example.TechMart.product.repository.ProductRepository;
import com.example.TechMart.profile.entity.Address;
import com.example.TechMart.profile.repository.ProfileRepository;
import com.example.TechMart.user.entity.Users;
import com.example.TechMart.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private ProductRepository productRepo;

    @Autowired
    private ProfileRepository profileRepo;

    @Autowired
    private OrderRepository orderRepo;

    @Autowired
    private OrderItemRepository orderItemRepo;

    @Autowired
    private ProductSearchRepository productSearchRepo;

    public Orders buyNow(BuyNowRequest dto, String email){

        Users user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("USER NOT FOUND"));

        Products product = productRepo.findById(dto.getProductId())
                .orElseThrow(() -> new RuntimeException("PRODUCT NOT FOUND"));

        Address address = profileRepo.findById(dto.getAddressId())
                .orElseThrow(() -> new RuntimeException("ADDRESS NOT FOUND"));

        Orders orders = new Orders();

        OrderItem orderItem = new OrderItem();

        if(product.getStock() < dto.getQuantity()){
            return null;
        }

        Long total_amount = Math.round(product.getPrice() * dto.getQuantity());

        product.setStock(product.getStock() - dto.getQuantity());
        product.setTotalSold(product.getTotalSold() + dto.getQuantity());
        productRepo.save(product);

        orders.setUser(user);
        orders.setTotalAmount(total_amount);
        orders.setStatus(Orders.Status.PLACED);
        orders.setAddress(address);

        orders = orderRepo.save(orders);

        orderItem.setOrders(orders);
        orderItem.setProduct(product);
        orderItem.setQuantity(dto.getQuantity());
        orderItem.setPrice(product.getPrice());

        orderItemRepo.save(orderItem);

        ProductDocument doc = productSearchRepo.findById(product.getId()).orElseThrow();

        if(doc != null){
            doc.setTotalSold(product.getTotalSold());
            productSearchRepo.save(doc);
        }

        return orders;
    }

    public List<OrderResponse> getUserOrders(String email){

        Users user = userRepo.findByEmail(email).orElseThrow();

        List<Orders> orders = orderRepo.findByUser(user);

        List<OrderResponse> res = new ArrayList<>();

        for(Orders order : orders){
            for(OrderItem item : order.getOrderItems()){
                OrderResponse dto = new OrderResponse();

                dto.setOrderId(order.getId());
                dto.setStatus(order.getStatus().name());
                dto.setQuantity(item.getQuantity());
                dto.setTotalAmount(order.getTotalAmount());
                dto.setImageUrl(item.getProduct().getImageUrl());
                dto.setProductName(item.getProduct().getName());
                dto.setCity(
                        order.getAddress() != null
                                ? order.getAddress().getCity()
                                : "No Address"
                );

                res.add(dto);
            }
        }
        return res;
    }

    public List<OrderResponse> getAllUserOrders(){
        List<OrderItem> items = orderItemRepo.findAll();

        List<OrderResponse> response = new ArrayList<>();

        for(OrderItem item : items){

            OrderResponse dto = new OrderResponse();

            dto.setOrderId(item.getOrders().getId());
            dto.setStatus(item.getOrders().getStatus().name());

            dto.setProductName(item.getProduct().getName());
            dto.setImageUrl(item.getProduct().getImageUrl());

            dto.setTotalAmount(item.getOrders().getTotalAmount());
            dto.setQuantity(item.getQuantity());

            dto.setCity(
                    item.getOrders().getAddress() != null
                            ? item.getOrders().getAddress().getCity()
                            : "No Address"
            );

            response.add(dto);
        }

        return response;
    }

    public String updateStatus(Long orderId, String status) {
        Orders order = orderRepo.findById(orderId).orElseThrow();

        order.setStatus(Orders.Status.valueOf(status));

        orderRepo.save(order);

        return "STATUS UPDATED";
    }

    public void syncTotalSold() {

        List<Products> products = productRepo.findAll();

        for(Products product : products){

            Integer sold = orderItemRepo.totalOrders(product.getId());

            product.setTotalSold(
                    sold == null ? 0 : sold
            );

            productRepo.save(product);
        }
    }
}
