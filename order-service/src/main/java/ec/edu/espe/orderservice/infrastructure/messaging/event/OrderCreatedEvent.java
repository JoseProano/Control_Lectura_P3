package ec.edu.espe.orderservice.infrastructure.messaging.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * OrderCreated Event - Published when an order is created
 * Follows Open/Closed Principle: Can be extended without modification
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderCreatedEvent {

    private String eventType;
    private UUID orderId;
    private UUID correlationId;
    private Instant createdAt;
    private List<OrderItemEvent> items;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderItemEvent {
        private UUID productId;
        private Integer quantity;
    }
}
