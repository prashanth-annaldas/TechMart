package com.example.TechMart.order.service;

import com.example.TechMart.order.dto.BuyNowRequest;
import com.example.TechMart.order.entity.OrderItem;
import com.example.TechMart.order.entity.Orders;
import com.example.TechMart.order.entity.Payment;
import com.example.TechMart.order.repository.OrderItemRepository;
import com.example.TechMart.order.repository.OrderRepository;
import com.example.TechMart.order.dto.RazorpayOrderResponse;
import com.example.TechMart.order.dto.VerifyPaymentRequest;
import com.example.TechMart.order.repository.PaymentHistoryResponse;
import com.example.TechMart.order.repository.PaymentRepository;
import com.example.TechMart.product.entity.Products;
import com.example.TechMart.product.repository.ProductRepository;
import com.example.TechMart.user.entity.Users;
import com.example.TechMart.user.repository.UserRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class PaymentService {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String secretKey;

    @Autowired
    private ProductRepository productRepo;

    @Autowired
    private OrderRepository orderRepo;

    @Autowired
    private OrderItemRepository orderItemRepo;

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private PaymentRepository paymentRepo;

    public RazorpayOrderResponse createOrder(BuyNowRequest dto, String email){
        try {
            Users user = userRepo.findByEmail(email).orElseThrow();
            Products product = productRepo.findById(dto.getProductId()).orElseThrow();

            long amount = (long) (product.getPrice() * dto.getQuantity() * 100);

            RazorpayClient client = new RazorpayClient(keyId, secretKey);

            JSONObject options = new JSONObject();

            options.put("amount", amount);
            options.put("currency", "INR");

            Order razorpayOrder = client.orders.create(options);

            Payment payment = new Payment();

            payment.setUser(user);
            payment.setStatus(Payment.PaymentStatus.CREATED);
            payment.setAmount(amount);
            payment.setCurrency("INR");
            payment.setPaymentTime(LocalDateTime.now());
            payment.setRazorpayOrderId(razorpayOrder.get("id"));

            paymentRepo.save(payment);

            RazorpayOrderResponse res = new RazorpayOrderResponse();

            res.setAmount(amount);
            res.setCurrency("INR");
            res.setRazorpayOrderId(razorpayOrder.get("id"));

            return res;
        }
        catch(Exception err){
            throw new RuntimeException(err);
        }
    }

    public Orders verifyPayment(VerifyPaymentRequest dto, String email) throws Exception{
        try{
            String payload = dto.getRazorpayOrderId() + "|" + dto.getRazorpayPaymentId();
            boolean isValid = Utils.verifySignature(
                    payload,
                    dto.getRazorpaySignature(),
                    secretKey
            );

            Payment payment = paymentRepo.findByRazorpayOrderId(dto.getRazorpayOrderId()).orElseThrow();

            if(!isValid) {
                payment.setPaymentTime(LocalDateTime.now());
                payment.setStatus(Payment.PaymentStatus.FAILED);
                paymentRepo.save(payment);
                throw new RuntimeException(
                        "Invalid payment signature"
                );
            }

            BuyNowRequest buyNowRequest = new BuyNowRequest();

            buyNowRequest.setQuantity(dto.getQuantity());
            buyNowRequest.setAddressId(dto.getAddressId());
            buyNowRequest.setProductId(dto.getProductId());

            Orders orders = orderService.buyNow(
                    buyNowRequest,
                    email
            );
            payment.setRazorpayPaymentId(
                    dto.getRazorpayPaymentId()
            );
            payment.setOrder(orders);
            payment.setStatus(
                    Payment.PaymentStatus.SUCCESS
            );
            paymentRepo.save(payment);

            return orders;
        }
        catch (Exception e) {

            System.out.println(
                    "ERROR CLASS = " + e.getClass().getName()
            );

            System.out.println(
                    "ERROR MESSAGE = " + e.getMessage()
            );

            e.printStackTrace();

            throw new RuntimeException(
                    "PAYMENT VERIFICATION FAILED",
                    e
            );
        }
    }

    public List<PaymentHistoryResponse> getOrdersHistory(String email){

        Users user = userRepo.findByEmail(email).orElseThrow();

        List<Payment> payments = paymentRepo.findByUser(user);

        List<PaymentHistoryResponse> response = new ArrayList<>();

        for (Payment payment : payments) {

            PaymentHistoryResponse dto =
                    new PaymentHistoryResponse();

            dto.setPaymentId(payment.getId());
            dto.setRazorpayOrderId(payment.getRazorpayOrderId());
            dto.setRazorpayPaymentId(payment.getRazorpayPaymentId());
            dto.setAmount(payment.getAmount());
            dto.setCurrency(payment.getCurrency());
            dto.setStatus(payment.getStatus().name());
            dto.setPaymentTime(payment.getPaymentTime());

            if (payment.getOrder() != null &&
                    !payment.getOrder().getOrderItems().isEmpty()) {

                OrderItem item = payment.getOrder()
                        .getOrderItems()
                        .get(0);

                dto.setProductName(
                        item.getProduct().getName()
                );

                dto.setImageUrl(
                        item.getProduct().getImageUrl()
                );
            }

            response.add(dto);
        }

        return response;
    }
}
