package ec.edu.espe.orderservice.application.service;

import ec.edu.espe.orderservice.application.dto.CreateOrderRequest;
import ec.edu.espe.orderservice.application.dto.CreateOrderResponse;
import ec.edu.espe.orderservice.application.dto.OrderResponse;

import java.util.UUID;

/**
 * Order Service Interface
 * Follows Interface Segregation Principle: Specific interface for order operations
 * Follows Dependency Inversion Principle: High-level modules depend on this abstraction
 */
public interface OrderService {

    /**
     * Create a new order
     */
    CreateOrderResponse createOrder(CreateOrderRequest request);

    /**
     * Get order by ID
     */
    OrderResponse getOrderById(UUID orderId);

    /**
     * Confirm order (called when stock is reserved)
     */
    void confirmOrder(UUID orderId);

    /**
     * Cancel order (called when stock is rejected)
     */
    void cancelOrder(UUID orderId, String reason);
}
