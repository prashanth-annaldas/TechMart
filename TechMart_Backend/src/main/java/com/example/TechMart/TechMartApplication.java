package com.example.TechMart;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class TechMartApplication {

	public static void main(String[] args) {
		SpringApplication.run(TechMartApplication.class, args);
	}

}
