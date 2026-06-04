package com.example.TechMart;

import com.example.TechMart.user.entity.Users;
import com.example.TechMart.user.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminInitializer {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder encoder;

    @PostConstruct
    public void init() {

        if(userRepository.count() == 0) {

            Users admin = new Users();

            admin.setName("Prashanth");

            admin.setEmail("admin@gmail.com");

            admin.setPassword(
                    encoder.encode("Admin@453")
            );

            admin.setRole(Users.Role.ADMIN);

            userRepository.save(admin);

            System.out.println("Admin Created");
        }
    }
}