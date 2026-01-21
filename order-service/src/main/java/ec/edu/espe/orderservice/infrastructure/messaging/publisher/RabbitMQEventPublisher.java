package ec.edu.espe.orderservice.infrastructure.messaging.publisher;

import ec.edu.espe.orderservice.domain.model.Order;
import ec.edu.espe.orderservice.infrastructure.messaging.event.OrderCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * RabbitMQ Event Publisher Implementation
 * Follows Single Responsibility Principle: Only publishes events to RabbitMQ
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class RabbitMQEventPublisher implements EventPublisher {

    private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.exchange.name}")
    private String exchangeName;

    @Value("${rabbitmq.routing-key.order-created}")
    private String orderCreatedRoutingKey;

    @Override
    public void publishOrderCreated(Order order) {
        try {
            OrderCreatedEvent event = OrderCreatedEvent.builder()
                    .eventType("OrderCreated")
                    .orderId(order.getOrderId())
                    .correlationId(UUID.randomUUID())
                    .createdAt(Instant.now())
                    .items(order.getItems().stream()
                            .map(item -> OrderCreatedEvent.OrderItemEvent.builder()
                                    .productId(item.getProductId())
                                    .quantity(item.getQuantity())
                                    .build())
                            .collect(Collectors.toList()))
                    .build();

            rabbitTemplate.convertAndSend(exchangeName, orderCreatedRoutingKey, event);
            log.info("Published OrderCreated event for order: {}", order.getOrderId());
        } catch (Exception e) {
            log.error("Failed to publish OrderCreated event for order: {}", order.getOrderId(), e);
            throw new RuntimeException("Failed to publish event", e);
        }
    }
}
