package com.example.TechMart.ai.service;

import com.example.TechMart.ai.dto.SearchIntent;
import com.example.TechMart.ai.entity.ChatMessage;
import com.example.TechMart.elasticsearch.document.ProductDocument;
import com.example.TechMart.elasticsearch.service.ProductSearchService;
import com.fasterxml.jackson.databind.ObjectMapper;
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

    @Autowired
    private ObjectMapper objectMapper;

    public String recommend(String query, List<ChatMessage> chatMessages) {

        StringBuilder context = new StringBuilder();

        for(ChatMessage m : chatMessages){
            context.append(m.getRole())
                    .append(": ")
                    .append(m.getMessage())
                    .append("\n");
        }

        context.append("USER: ").append(query);

        SearchIntent intent = extractIntent(context.toString());

        System.out.println("Intent = " + intent);

        StringBuilder sb = new StringBuilder();

        if (intent.getCategory() != null) {
            sb.append(intent.getCategory()).append(" ");
        }

        if (intent.getBrand() != null) {
            sb.append(intent.getBrand()).append(" ");
        }

        if (intent.getKeywords() != null) {
            for (String keyword : intent.getKeywords()) {
                sb.append(keyword).append(" ");
            }
        }

        String searchQuery = sb.toString().trim();

        if (searchQuery.isBlank()) {
            searchQuery = query;
        }

        System.out.println("Search Query = " + searchQuery);

        List<ProductDocument> products =
                productSearchService.elasticSearchForAi(searchQuery);

        System.out.println("After ES Search = " + products.size());

        products.forEach(p ->
                System.out.println("ES -> " + p.getName()));

        if(intent.getCategory() != null){

            products = products.stream()
                    .filter(p ->
                            p.getCategory() != null &&
                                    p.getCategory().toLowerCase()
                                            .contains(intent.getCategory().toLowerCase()))
                    .toList();
        }
        System.out.println("After Category Filter = " + products.size());

        if(intent.getBudget()!=null){

            products = products.stream()
                    .filter(p ->
                            p.getPrice()<=intent.getBudget())
                    .toList();
        }

        System.out.println("After Budget Filter = " + products.size());

        if(intent.getBrand()!=null){

            products = products.stream()
                    .filter(p ->
                            p.getName() != null &&
                            p.getName()
                                    .toLowerCase()
                                    .contains(
                                            intent.getBrand()
                                                    .toLowerCase()))
                    .toList();
        }

        System.out.println("After Stock Filter = " + products.size());

        products = products.stream()
                .filter(p -> p.getStock() != null && p.getStock() > 0)
                .toList();

        products = products.stream()
                .sorted(
                        (a, b) -> Double.compare(
                                b.getSalesScore() == null ? 0 : b.getSalesScore(),
                                a.getSalesScore() == null ? 0 : a.getSalesScore()
                        )
                )
                .limit(10)
                .toList();

        if(products == null || products.isEmpty()){
            return "Sorry, we couldn't find a suitable product.";
        }

        StringBuilder chatHistory = new StringBuilder();

        for(ChatMessage m : chatMessages){

            chatHistory.append(m.getRole())
                    .append(": ")
                    .append(m.getMessage())
                    .append("\n");
        }

        chatHistory.append("USER: ")
                .append(query);

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

The products below have ALREADY been filtered by TechMart.

IMPORTANT RULES:

- Every product shown already satisfies the user's hard constraints.
- The products have already been filtered by:
    • Category
    • Brand (if specified)
    • Budget
    • Stock availability
- NEVER reject any product because of its price.
- NEVER say a product exceeds the user's budget.
- NEVER say no products match if the filtered product list is not empty.
- NEVER invent products or mention products that are not in the list.
- Recommend ONLY from the provided products.
- If one or more products are available, you MUST recommend them.
- Only reply:
  "Sorry, we couldn't find a suitable product."
  when the filtered product list is completely empty.
- Rank products from best to worst.
- Prefer products with:
    • Higher Rating
    • More Reviews
    • Higher Total Sold
    • Higher Popularity Score
    • Better match with the user's purpose
- Mention the Product ID in every recommendation.
- Explain briefly why each product is recommended.
- Do not compare with products that are not in the filtered list.

You must use the previous conversation.

If the current query is incomplete such as

"only ASUS"

"cheaper"

"battery life?"

"what about Dell?"

assume the user is referring to the previous products discussed.

Never ignore the conversation history.

Do not ask the user to repeat themselves if the answer exists in the history.

Conversation History:
                
%s
                
Current User Query:
                
%s

Filtered Products:
%s

Return the response in markdown using EXACTLY this format:

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

🥉 Product Name
Product ID:
Price:
Rating:
Reviews:
Total Sold:
Reason:

🏅 Product Name
Product ID:
Price:
Rating:
Reviews:
Total Sold:
Reason:

🏅 Product Name
Product ID:
Price:
Rating:
Reviews:
Total Sold:
Reason:

Do not include any introduction or conclusion.
""".formatted(chatHistory, query, productContext);

        System.out.println(prompt);

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

        ResponseEntity<Map> response;

        try {
            response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    Map.class
            );
        }
        catch (HttpClientErrorException ex) {
            return "AI service error: " + ex.getResponseBodyAsString();
        }
        catch (Exception ex) {
            ex.printStackTrace();
            return "Unable to contact AI service.";
        }

        try {

            if (response.getBody() == null ||
                    !response.getBody().containsKey("choices")) {

                return "Unable to generate recommendations.";
            }

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

    private SearchIntent extractIntent(String query) {

        String prompt = """
You are an AI shopping assistant.

Extract the user's shopping intent.

Return ONLY valid JSON.

Schema:

{
  "category": null,
  "brand": null,
  "budget": null,
  "keywords": [],
  "purpose": null,
  "sort": null
}

Available Categories:

- Mobiles
- Laptops
- Tablets
- Smart Watches
- Headphones
- Earbuds
- Bluetooth Speakers
- Gaming Consoles
- Gaming Keyboards
- Gaming Mice
- Monitors
- Printers
- Routers
- Power Banks
- Chargers
- Mobile Cases
- External SSDs
- Pendrives
- Webcams
- Smart Home Devices

IMPORTANT RULES:

- category MUST be EXACTLY one of the above categories.
- Never invent a new category.
- Map similar words to the closest category.
- Examples:
    - "phone cover" → "Mobile Cases"
    - "mobile accessories" → "Mobile Cases"
    - "wireless mouse" → "Gaming Mice"
    - "gaming laptop" → "Laptops"
    - "bluetooth earbuds" → "Earbuds"
- If no category matches, return null.

User Query:

%s
""".formatted(query);

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

        body.put(
                "response_format",
                Map.of(
                        "type",
                        "json_object"
                )
        );

        body.put("temperature", 0);

        HttpEntity<Map<String, Object>> entity =
                new HttpEntity<>(body, headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                Map.class
        );

        List<?> choices =
                (List<?>) response.getBody().get("choices");

        Map<?, ?> choice =
                (Map<?, ?>) choices.get(0);

        Map<?, ?> message =
                (Map<?, ?>) choice.get("message");

        String json =
                message.get("content").toString();

        try {
            return objectMapper.readValue(
                    json,
                    SearchIntent.class
            );
        }
        catch (Exception ex) {
            ex.printStackTrace();
            return new SearchIntent();
        }
    }
}