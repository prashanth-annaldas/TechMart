package com.example.TechMart.ai.repository;

import com.example.TechMart.ai.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    List<Conversation> findByUserIdOrderByUpdatedAtDesc(Long userId);

    List<Conversation> findByUserEmailOrderByCreatedAtDesc(String email);
}
