package com.example.TechMart.profile.controller;

import com.example.TechMart.profile.dto.ProfileRequest;
import com.example.TechMart.profile.entity.Address;
import com.example.TechMart.profile.repository.ProfileRepository;
import com.example.TechMart.profile.service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import javax.security.sasl.AuthorizeCallback;
import java.util.List;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @PostMapping("/address")
    public String uploadAddress(@RequestBody ProfileRequest dto, Authentication authentication){
        return profileService.uploadAddress(dto, authentication.getName());
    }

    @GetMapping("/allAddresses")
    public List<Address> getAllAddresses(Authentication authentication) {
        return profileService.getAllAddresses(authentication.getName());
    }

    @PutMapping("/editAddress/{addressId}")
    public String updateAddress(@PathVariable Long addressId, Authentication authentication, @RequestBody ProfileRequest dto){
        return profileService.updateAdress(addressId, authentication.getName(), dto);
    }

    @DeleteMapping("/deleteAddress/{addressId}")
    public String deleteAddress(@PathVariable Long addressId, Authentication authentication){
        return profileService.deleteAddress(addressId, authentication.getName());
    }
}
