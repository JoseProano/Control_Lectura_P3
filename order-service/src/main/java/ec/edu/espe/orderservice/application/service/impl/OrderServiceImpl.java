package ec.edu.espe.orderservice.application.service.impl;

import ec.edu.espe.orderservice.application.dto.*;
import ec.edu.espe.orderservice.application.service.OrderService;
import ec.edu.espe.orderservice.domain.model.Order;
import ec.edu.espe.orderservice.domain.model.OrderItem;
import ec.edu.espe.orderservice.domain.model.OrderStatus;
import ec.edu.espe.orderservice.domain.model.ShippingAddress;
import ec.edu.espe.orderservice.domain.repository.OrderRepository;
import ec.edu.espe.orderservice.infrastructure.messaging.publisher.EventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Order Service Implementation
 * Follows Single Responsibility Principle: Manages order business logic
 * Follows Dependency Inversion Principle: Depends on abstractions (interfaces)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final EventPublisher eventPublisher;
    private final OrderMapper orderMapper;

    @Override
    @Transactional
    public CreateOrderResponse createOrder(CreateOrderRequest request) {
        log.info("Creating order for customer: {}", request.getCustomerId());

        // Create order entity
        Order order = Order.builder()
                .customerId(request.getCustomerId())
                .status(OrderStatus.PENDING)
                .shippingAddress(ShippingAddress.builder()
                        .country(request.getShippingAddress().getCountry())
                        .city(request.getShippingAddress().getCity())
                        .street(request.getShippingAddress().getStreet())
                        .postalCode(request.getShippingAddress().getPostalCode())
                        .build())
                .paymentReference(request.getPaymentReference())
                .build();

        // Add order items
        request.getItems().forEach(itemRequest -> {
            OrderItem item = OrderItem.builder()
                    .productId(itemRequest.getProductId())
                    .quantity(itemRequest.getQuantity())
                    .build();
            order.addItem(item);
        });

        // Save order
        Order savedOrder = orderRepository.save(order);
        log.info("Order created with ID: {}", savedOrder.getOrderId());

        // Publish OrderCreated event asynchronously
        eventPublisher.publishOrderCreated(savedOrder);

        return CreateOrderResponse.builder()
                .orderId(savedOrder.getOrderId())
                .status(savedOrder.getStatus().name())
                .message("Order received. Inventory check in progress.")
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(UUID orderId) {
        log.info("Retrieving order: {}", orderId);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        return orderMapper.toOrderResponse(order);
    }

    @Override
    @Transactional
    public void confirmOrder(UUID orderId) {
        log.info("Confirming order: {}", orderId);

        Order order = findOrderWithRetry(orderId, 3);
        order.confirm();
        orderRepository.save(order);

        log.info("Order confirmed: {}", orderId);
    }

    @Override
    @Transactional
    public void cancelOrder(UUID orderId, String reason) {
        log.info("Cancelling order: {} with reason: {}", orderId, reason);

        Order order = findOrderWithRetry(orderId, 3);
        order.cancel(reason);
        orderRepository.save(order);

        log.info("Order cancelled: {}", orderId);
    }
    
    private Order findOrderWithRetry(UUID orderId, int maxAttempts) {
        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            Optional<Order> orderOpt = orderRepository.findById(orderId);
            if (orderOpt.isPresent()) {
                return orderOpt.get();
            }
            
            if (attempt < maxAttempts) {
                log.warn("Order {} not found, attempt {}/{}. Retrying...", orderId, attempt, maxAttempts);
                try {
                    Thread.sleep(100 * attempt); // Exponential backoff: 100ms, 200ms, 300ms
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException("Interrupted while waiting for order: " + orderId, e);
                }
            }
        }
        
        throw new RuntimeException("Order not found after " + maxAttempts + " attempts: " + orderId);
    }
}
