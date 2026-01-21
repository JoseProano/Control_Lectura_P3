package ec.edu.espe.orderservice.infrastructure.messaging.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * StockReserved Event - Received when stock is successfully reserved
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockReservedEvent {

    private String eventType;
    private UUID orderId;
    private UUID correlationId;
    private List<ReservedItem> reservedItems;
    private Instant reservedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReservedItem {
        private UUID productId;
        private Integer quantity;
    }
}
