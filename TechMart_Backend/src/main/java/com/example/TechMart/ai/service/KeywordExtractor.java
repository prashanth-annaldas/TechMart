package com.example.TechMart.ai.service;

import java.util.Arrays;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

public class KeywordExtractor {

        private static final Set<String> STOP_WORDS = Set.of(
                "best", "top", "under", "below", "around", "recommend",
                "suggest", "show", "find", "give", "me", "for", "with",
                "a", "an", "the", "is", "of", "to", "buy", "price",
                "good", "latest", "new"
        );

        public static String extract(String query) {

            query = query.toLowerCase();

            query = query.replaceAll("₹?\\d+", "");

            return Arrays.stream(query.split("\\s+"))
                    .filter(word -> !STOP_WORDS.contains(word))
                    .collect(Collectors.joining(" "));
        }

    private static final Pattern PATTERN =
            Pattern.compile("(?:under|below|less than|upto|up to)?\\s*₹?\\s*(\\d{4,7})",
                    Pattern.CASE_INSENSITIVE);

    public static Integer budgetExtract(String query) {

        Matcher matcher = PATTERN.matcher(query);

        while (matcher.find()) {
            return Integer.parseInt(matcher.group(1));
        }

        return null;
    }

}
