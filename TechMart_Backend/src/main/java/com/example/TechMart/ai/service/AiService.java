package com.example.TechMart.ai.service;

import com.example.TechMart.elasticsearch.document.ProductDocument;
import com.example.TechMart.elasticsearch.service.ProductSearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AiService {

    @Value("${groq.api.key}")
    private String apiKey;

    @Autowired
    private ProductSearchService productSearchService;

    @Autowired
    private RestTemplate restTemplate;

    public String recommend(String query) {

        List<ProductDocument> products = productSearchService.elasticSearchForAi(KeywordExtractor.extract(query));

        if(products.isEmpty()){
            return "Sorry, no matching products were found in TechMart.";
        }

        Integer budget = KeywordExtractor.budgetExtract(query);

        if(budget != null) {
            products = products.stream()
                    .filter(p -> p.getPrice() <= budget)
                    .toList();
        }

        products.forEach(p -> {
            System.out.println(
                    p.getName() + " -> ₹" + p.getPrice()
            );
        });

        StringBuilder productContext = new StringBuilder();

        for (ProductDocument product : products) {

            productContext.append("""
                Product ID: %d
                Name: %s
                Category: %s
                Price: ₹%.2f
                Rating: %.1f
                Reviews: %d
                Total Sold: %d
                Stock Available: %d
                Popularity Score: %.2f
                Description: %s

                ----------------------------

                """.formatted(
                    product.getId(),
                    product.getName(),
                    product.getCategory(),
                    product.getPrice(),
                    product.getAverageRating() == null ? 0.0 : product.getAverageRating(),
                    product.getReviewCount() == null ? 0 : product.getReviewCount(),
                    product.getTotalSold() == null ? 0 : product.getTotalSold(),
                    product.getStock() == null ? 0 : product.getStock(),
                    product.getSalesScore() == null ? 0.0 : product.getSalesScore(),
                    product.getDescription()
                )
            );
        }

        String prompt = """
                You are TechMart AI Shopping Assistant.
                
                Your job is to recommend ONLY products from the list below.
                
                User Query:
                %s
                
                Available Products:
                %s
                
                Instructions:
                
                - Never invent products.
                - Recommend at most 5 products.
                - Rank them from best to worst.
                - Consider:
                    • User intent
                    • Price
                    • Rating
                    • Popularity
                    • Reviews
                    • Stock availability
                - Mention the Product ID in every recommendation.
                - If no product matches, say:
                  "Sorry, we couldn't find a suitable product."
                
                Return markdown in this format:
                
                🥇 Product Name
                Product ID:
                Price:
                Rating:
                Reviews:
                Total Sold:
                Reason:
                
                🥈 Product Name
                Product ID:
                Price:
                Rating:
                Reviews:
                Total Sold:
                Reason:
                
                """.formatted(query, productContext);

        String url = "https://api.groq.com/openai/v1/chat/completions";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> body = new HashMap<>();

        body.put("model", "llama-3.3-70b-versatile");

        body.put("messages", List.of(
                Map.of(
                        "role", "user",
                        "content", prompt
                )
        ));

        body.put("temperature", 0.4);
        body.put("max_tokens", 800);
        body.put("top_p", 0.9);

        HttpEntity<Map<String, Object>> entity =
                new HttpEntity<>(body, headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                Map.class
        );

        try {

            List<?> choices = (List<?>) response.getBody().get("choices");

            Map<?, ?> choice = (Map<?, ?>) choices.get(0);

            Map<?, ?> message = (Map<?, ?>) choice.get("message");

            return message.get("content").toString();

        }
        catch(HttpClientErrorException ex){
            return "AI service error: " + ex.getResponseBodyAsString();
        }
        catch(Exception ex){
            ex.printStackTrace();
            return "Unable to generate recommendations.";
        }
    }
}