package ec.edu.espe.orderservice.infrastructure.messaging.consumer;

import ec.edu.espe.orderservice.application.service.OrderService;
import ec.edu.espe.orderservice.infrastructure.messaging.event.StockRejectedEvent;
import ec.edu.espe.orderservice.infrastructure.messaging.event.StockReservedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;

/**
 * Stock Response Event Consumer
 * Follows Single Responsibility Principle: Only consumes stock response events
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class StockResponseConsumer {

    private final OrderService orderService;

    /**
     * Handle StockReserved event
     */
    @RabbitListener(queues = "${rabbitmq.queue.stock-response}")
    public void handleStockResponse(Message message) {
        String messageContent = null;
        try {
            messageContent = new String(message.getBody(), StandardCharsets.UTF_8);
            log.info("==> Received stock response: {}", messageContent);
            
            // Parse the event based on eventType
            if (messageContent.contains("\"eventType\":\"StockReserved\"")) {
                log.info("==> Processing as StockReserved");
                handleStockReserved(messageContent);
            } else if (messageContent.contains("\"eventType\":\"StockRejected\"")) {
                log.info("==> Processing as StockRejected");
                handleStockRejected(messageContent);
            } else {
                log.warn("==> Unknown event type in message: {}", messageContent);
            }
        } catch (Exception e) {
            log.error("Failed to process stock response: {}", messageContent, e);
            throw new RuntimeException("Failed to process message", e);
        }
    }

    private void handleStockReserved(String message) {
        try {
            // Parse JSON manually or use ObjectMapper
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            mapper.findAndRegisterModules();
            StockReservedEvent event = mapper.readValue(message, StockReservedEvent.class);
            
            log.info("Processing StockReserved event for order: {}", event.getOrderId());
            orderService.confirmOrder(event.getOrderId());
            log.info("Order confirmed successfully: {}", event.getOrderId());
        } catch (Exception e) {
            log.error("Failed to handle StockReserved event", e);
        }
    }

    private void handleStockRejected(String message) {
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            mapper.findAndRegisterModules();
            StockRejectedEvent event = mapper.readValue(message, StockRejectedEvent.class);
            
            log.info("Processing StockRejected event for order: {}", event.getOrderId());
            orderService.cancelOrder(event.getOrderId(), event.getReason());
            log.info("Order cancelled successfully: {}", event.getOrderId());
        } catch (Exception e) {
            log.error("Failed to handle StockRejected event", e);
        }
    }
}
