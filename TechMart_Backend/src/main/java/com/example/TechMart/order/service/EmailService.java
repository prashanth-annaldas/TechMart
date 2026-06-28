package com.example.TechMart.order.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender javaMailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendOrderConfirmation(
            String customerName,
            String customerEmail,
            Long orderId,
            String productName,
            Integer quantity,
            Double amount
    ) {

        String subject =
                "TechMart Order Confirmation #" + orderId;

        String body = """
                Dear %s,

                Thank you for shopping with TechMart.

                We are pleased to inform you that your order has been placed successfully.

                --------------------------------------------------
                             ORDER DETAILS
                --------------------------------------------------

                Order ID      : %d
                Product       : %s
                Quantity      : %d
                Total Amount  : ₹%.2f

                --------------------------------------------------

                Your order is currently being processed.
                You will receive another notification once it has been shipped.

                If you have any questions regarding your order,
                please contact our support team.

                Thank you for choosing TechMart.

                Best Regards,

                TechMart Team
                support@techmart.com
                """.formatted(
                customerName,
                orderId,
                productName,
                quantity,
                amount
        );

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setFrom(fromEmail);
        message.setTo(customerEmail);
        message.setSubject(subject);
        message.setText(body);

        javaMailSender.send(message);
    }
}
