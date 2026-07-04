package com.example.TechMart.ai.service;

import com.example.TechMart.ai.dto.ChatDTO;
import com.example.TechMart.ai.dto.ConversationDTO;
import com.example.TechMart.ai.entity.ChatMessage;
import com.example.TechMart.ai.entity.Conversation;
import com.example.TechMart.ai.repository.ChatMessageRepository;
import com.example.TechMart.ai.repository.ConversationRepository;
import com.example.TechMart.user.entity.Users;
import com.example.TechMart.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChatService {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private ConversationRepository conversationRepo;

    @Autowired
    private ChatMessageRepository chatMessageRepo;

    @Autowired
    private AiService aiService;

    public ChatDTO addMessage(Long conversationId, String message){
        Conversation conversation = conversationRepo.findById(conversationId).orElseThrow(() -> new RuntimeException("Conversation not found!!"));

        ChatMessage userMessage = new ChatMessage();

        userMessage.setConversation(conversation);
        userMessage.setRole(ChatMessage.MessageRole.USER);
        userMessage.setMessage(message);

        chatMessageRepo.save(userMessage);

        List<ChatMessage> chatMessages = chatMessageRepo.findByConversationIdOrderByCreatedAtAsc(conversationId);

        String aiResponse = aiService.recommend(message, chatMessages);

        ChatMessage aiMessage = new ChatMessage();

        aiMessage.setConversation(conversation);
        aiMessage.setRole(ChatMessage.MessageRole.AI);
        aiMessage.setMessage(aiResponse);

        ChatMessage savedChatMessage = chatMessageRepo.save(aiMessage);

        ChatDTO dto = new ChatDTO();
        dto.setMessage(savedChatMessage.getMessage());
        dto.setId(savedChatMessage.getId());
        dto.setRole(savedChatMessage.getRole().name());

        return dto;
    }

    public List<ChatDTO> getMessages(Long conversationId){
        return chatMessageRepo.findByConversationIdOrderByCreatedAtAsc(conversationId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    public List<ConversationDTO> getConversations(String email) {

        return conversationRepo
                .findByUserEmailOrderByCreatedAtDesc(email)
                .stream()
                .map(c -> {
                    ConversationDTO dto = new ConversationDTO();
                    dto.setId(c.getId());
                    dto.setTitle(c.getTitle());
                    return dto;
                })
                .toList();
    }

    private ChatDTO toDto(ChatMessage chatMessage) {
        ChatDTO dto = new ChatDTO();

        dto.setId(chatMessage.getId());
        dto.setMessage(chatMessage.getMessage());
        dto.setRole(chatMessage.getRole().name());

        return dto;
    }

    public ConversationDTO createConversation(String firstMessage, String email) {

        Users user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Conversation conversation = new Conversation();

        conversation.setUser(user);
        conversation.setTitle(generateTitle(firstMessage));

        Conversation savedConversation = conversationRepo.save(conversation);

        ConversationDTO dto = new ConversationDTO();
        dto.setId(savedConversation.getId());
        dto.setTitle(savedConversation.getTitle());

        return dto;
    }

    private String generateTitle(String message) {

        if (message.length() <= 40) {
            return message;
        }

        return message.substring(0, 40) + "...";
    }

    public String deleteConversation(Long conversationId, String email){
        Users user = userRepo.findByEmail(email).orElseThrow();

        Conversation conversation = conversationRepo.findById(conversationId).orElseThrow();

        if (!conversation.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        conversationRepo.delete(conversation);

        ChatMessage chatMessage = chatMessageRepo.findByConversation(conversation);
        chatMessageRepo.deleteByConversation(conversation);

        return "DELETED";
    }
}
