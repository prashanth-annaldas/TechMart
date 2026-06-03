package com.example.TechMart.security;

import java.security.Key;
import java.util.Date;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jdk.jshell.spi.ExecutionControl;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

@Component
public class JwtService {
    private static final String SECRET_KEY = "mysecretkeymysecretkeymysecretkey12";

    private final Key key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());

    public String generateToken(String email, String role){
        return Jwts.builder()
                .setSubject(email)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60))
                .signWith(
                        key,
                        SignatureAlgorithm.HS256
                )
                .compact();
    }

    public boolean validateToken(String token){
        try{
            extractAllClaims(token);
            return true;
        }
        catch(Exception e){
            return false;
        }
    }

    public String extractEmailByToken(String token){
        return extractAllClaims(token).getSubject();
    }

    public Claims extractAllClaims(String token){
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String extractRoleByToken(String token){
        return extractAllClaims(token).get("role", String.class);
    }
}
