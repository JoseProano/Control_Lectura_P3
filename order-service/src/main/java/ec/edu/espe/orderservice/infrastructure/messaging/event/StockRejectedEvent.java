package ec.edu.espe.orderservice.infrastructure.messaging.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * StockRejected Event - Received when stock reservation fails
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockRejectedEvent {

    private String eventType;
    private UUID orderId;
    private UUID correlationId;
    private String reason;
    private Instant rejectedAt;
}
