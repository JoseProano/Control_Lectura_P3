package ec.edu.espe.orderservice.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * OrderResponse DTO - Full order details
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {

    private UUID orderId;
    private UUID customerId;
    private String status;
    private List<OrderItemResponse> items;
    private ShippingAddressResponse shippingAddress;
    private String paymentReference;
    private String reason; // For CANCELLED status
    private String message; // For PENDING status
    private Instant updatedAt;
}
