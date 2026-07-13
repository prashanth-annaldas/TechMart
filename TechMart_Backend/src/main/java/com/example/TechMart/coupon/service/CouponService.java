package com.example.TechMart.coupon.service;

import com.example.TechMart.coupon.dto.CouponRequest;
import com.example.TechMart.coupon.dto.CouponResponse;
import com.example.TechMart.coupon.entity.Coupon;
import com.example.TechMart.coupon.repository.CouponRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CouponService {

    @Autowired
    private CouponRepository couponRepo;

    public String createCoupon(CouponRequest dto){

        if(couponRepo.findByCode(dto.getCode()).isPresent()){
            throw new RuntimeException("Coupon code already exists");
        }

        if (dto.getStartDate().isAfter(dto.getEndDate())) {
            throw new RuntimeException("Start date cannot be after end date");
        }

        if (dto.getDiscountType().equals("PERCENTAGE")
                && (dto.getDiscount() <= 0 || dto.getDiscount() > 100)) {
            throw new RuntimeException("Percentage discount must be between 1 and 100");
        }

        if (dto.getDiscountType().equals("FIXED")
                && dto.getDiscount() <= 0) {
            throw new RuntimeException("Fixed discount must be greater than 0");
        }

        Coupon coupon = new Coupon();

        coupon.setCode(dto.getCode());
        coupon.setDescription(dto.getDescription());
        coupon.setDiscount(dto.getDiscount());
        coupon.setDiscountType(Coupon.DiscountType.valueOf(dto.getDiscountType()));
        coupon.setStartDate(dto.getStartDate());
        coupon.setEndDate(dto.getEndDate());
        coupon.setMinOrderAmount(dto.getMinOrderAmount());
        coupon.setMaxDiscount(dto.getMaxDiscount());
        coupon.setUsageLimit(dto.getUsageLimit());

        couponRepo.save(coupon);

        return "COUPON CREATED";
    }

    public List<Coupon> getAllCoupons(){
        return couponRepo.findAll();
    }
}
