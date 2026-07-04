package com.example.TechMart.ai.repository;

import com.example.TechMart.ai.entity.ChatMessage;
import com.example.TechMart.ai.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByConversationIdOrderByCreatedAtAsc(Long conversationId);

    ChatMessage findByConversation(Conversation conversation);

    void deleteByConversation(Conversation conversation);
}
