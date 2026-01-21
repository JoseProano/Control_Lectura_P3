package ec.edu.espe.orderservice.application.service.impl;

import ec.edu.espe.orderservice.application.dto.*;
import ec.edu.espe.orderservice.domain.model.Order;
import ec.edu.espe.orderservice.domain.model.OrderStatus;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

/**
 * Order Mapper - Maps between domain entities and DTOs
 * Follows Single Responsibility Principle: Only handles mapping
 */
@Component
public class OrderMapper {

    public OrderResponse toOrderResponse(Order order) {
        OrderResponse.OrderResponseBuilder builder = OrderResponse.builder()
                .orderId(order.getOrderId())
                .customerId(order.getCustomerId())
                .status(order.getStatus().name())
                .items(order.getItems().stream()
                        .map(item -> OrderItemResponse.builder()
                                .productId(item.getProductId())
                                .quantity(item.getQuantity())
                                .build())
                        .collect(Collectors.toList()))
                .updatedAt(order.getUpdatedAt());

        // Add shipping address if present
        if (order.getShippingAddress() != null) {
            builder.shippingAddress(ShippingAddressResponse.builder()
                    .country(order.getShippingAddress().getCountry())
                    .city(order.getShippingAddress().getCity())
                    .street(order.getShippingAddress().getStreet())
                    .postalCode(order.getShippingAddress().getPostalCode())
                    .build());
        }

        // Add payment reference if present
        if (order.getPaymentReference() != null) {
            builder.paymentReference(order.getPaymentReference());
        }

        // Add reason for cancelled orders
        if (order.getStatus() == OrderStatus.CANCELLED && order.getCancellationReason() != null) {
            builder.reason(order.getCancellationReason());
        }

        // Add message for pending orders
        if (order.getStatus() == OrderStatus.PENDING) {
            builder.message("Inventory verification pending.");
        }

        return builder.build();
    }
}
