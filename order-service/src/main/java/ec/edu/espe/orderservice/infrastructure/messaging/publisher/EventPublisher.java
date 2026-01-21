package ec.edu.espe.orderservice.infrastructure.messaging.publisher;

import ec.edu.espe.orderservice.domain.model.Order;

/**
 * Event Publisher Interface
 * Follows Interface Segregation Principle and Dependency Inversion Principle
 */
public interface EventPublisher {

    /**
     * Publish OrderCreated event
     */
    void publishOrderCreated(Order order);
}
