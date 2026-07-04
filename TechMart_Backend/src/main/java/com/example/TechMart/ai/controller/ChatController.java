package com.example.TechMart.ai.controller;

import com.example.TechMart.ai.dto.ChatDTO;
import com.example.TechMart.ai.dto.ChatMessageDTO;
import com.example.TechMart.ai.dto.ConversationDTO;
import com.example.TechMart.ai.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @PostMapping
    public ConversationDTO createConversation(@RequestBody ChatMessageDTO dto, Authentication authentication) {
        return chatService.createConversation(dto.getMessage(), authentication.getName());
    }

    @PostMapping("/{conversationId}/addMessage")
    public ChatDTO addMessage(@PathVariable Long conversationId, @RequestBody ChatMessageDTO dto){
        return chatService.addMessage(conversationId, dto.getMessage());
    }

    @GetMapping("/{conversationId}")
    public List<ChatDTO> getMessages(@PathVariable Long conversationId){
        return chatService.getMessages(conversationId);
    }

    @GetMapping("/conversations")
    public List<ConversationDTO> getConversations(Authentication authentication) {

        return chatService.getConversations(authentication.getName());
    }

    @DeleteMapping("/{conversationId}")
    public String deleteConversation(@PathVariable Long conversationId, Authentication authentication){
        return chatService.deleteConversation(conversationId, authentication.getName());
    }
}
