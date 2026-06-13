package com.example.TechMart.profile.service;

import com.example.TechMart.profile.dto.ProfileRequest;
import com.example.TechMart.profile.entity.Address;
import com.example.TechMart.profile.repository.ProfileRepository;
import com.example.TechMart.user.entity.Users;
import com.example.TechMart.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProfileService {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private ProfileRepository profileRepo;

    public String uploadAddress(ProfileRequest dto, String email) {
        Address address = new Address();

        Users user = userRepo.findByEmail(email).orElseThrow();

        address.setCity(dto.getCity());
        address.setCountry(dto.getCountry());
        address.setFullName(dto.getFullName());
        address.setHouseNo(dto.getHouseNo());
        address.setPincode(dto.getPincode());
        address.setPhoneNumber(dto.getPhoneNumber());
        address.setState(dto.getState());
        address.setStreet(dto.getStreet());
        address.setLandmark(dto.getLandmark());
        address.setUser(user);

        profileRepo.save(address);

        return "PROFILE SAVED";
    }

    public List<Address> getAllAddresses(String email){
        Users user = userRepo.findByEmail(email).orElseThrow();

        return profileRepo.findByUser(user);
    }

    public String updateAdress(Long addressId, String email, ProfileRequest dto) {
        Users user = userRepo.findByEmail(email).orElseThrow();

        Address address = profileRepo.findById(addressId).orElseThrow();

        if (!address.getUser().getId().equals(user.getId())) {
            return "UNAUTHORIZED";
        }

        address.setLandmark(dto.getLandmark());
        address.setCity(dto.getCity());
        address.setStreet(dto.getStreet());
        address.setPincode(dto.getPincode());
        address.setState(dto.getState());
        address.setPhoneNumber(dto.getPhoneNumber());
        address.setHouseNo(dto.getHouseNo());
        address.setFullName(dto.getFullName());
        address.setCountry(dto.getCountry());

        profileRepo.save(address);

        return "PROFILE UPDATED";
    }

    public String deleteAddress(Long addressId, String email){

        Users user = userRepo.findByEmail(email).orElseThrow();

        Address address = profileRepo.findById(addressId).orElseThrow();

        if(!address.getUser().getId().equals(user.getId())){
            throw new RuntimeException(
                    "UNAUTHORIZED"
            );
        }

        profileRepo.delete(address);

        return "ADDRESS DELETED";
    }
}
