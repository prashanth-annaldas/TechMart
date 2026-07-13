package com.example.TechMart.coupon.controller;

import com.example.TechMart.coupon.dto.CouponRequest;
import com.example.TechMart.coupon.entity.Coupon;
import com.example.TechMart.coupon.repository.CouponRepository;
import com.example.TechMart.coupon.service.CouponService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class CouponController {

    @Autowired
    private CouponService couponService;

    @Autowired
    private CouponRepository couponRepo;

    @PostMapping("/admin/create-coupon")
    public String createCoupon(@RequestBody CouponRequest dto){
        return couponService.createCoupon(dto);
    }

    @GetMapping("/admin/coupons")
    public List<Coupon> getAllCoupons(){
        return couponService.getAllCoupons();
    }
}
