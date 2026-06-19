package com.example.TechMart.elasticsearch.repository;

import com.example.TechMart.elasticsearch.document.ProductDocument;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.data.elasticsearch.annotations.Query;

import java.util.List;

public interface ProductSearchRepository extends ElasticsearchRepository<ProductDocument, Long> {
    @Query("""
    {
      "function_score": {
        "query": {
          "multi_match": {
            "query": "?0",
            "fields": [
              "name^3",
              "category^2",
              "description"
            ],
            "fuzziness": "AUTO"
          }
        },
        "field_value_factor": {
          "field": "salesScore",
          "factor": 0.1,
          "modifier": "sqrt",
          "missing": 1
        },
        "boost_mode": "sum"
      }
    }
    """)
    List<ProductDocument> fuzzySearch(String name);

    List<ProductDocument> findByNameStartingWithIgnoreCase(String name);
}
