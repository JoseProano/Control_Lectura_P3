/**
 * Order Created Event
 */
export interface OrderCreatedEvent {
  eventType: string;
  orderId: string;
  correlationId: string;
  createdAt: string;
  items: OrderItemEvent[];
}

export interface OrderItemEvent {
  productId: string;
  quantity: number;
}

/**
 * Stock Reserved Event
 */
export interface StockReservedEvent {
  eventType: string;
  orderId: string;
  correlationId: string;
  reservedItems: ReservedItem[];
  reservedAt: number; // Unix timestamp in seconds
}

export interface ReservedItem {
  productId: string;
  quantity: number;
}

/**
 * Stock Rejected Event
 */
export interface StockRejectedEvent {
  eventType: string;
  orderId: string;
  correlationId: string;
  reason: string;
  rejectedAt: number; // Unix timestamp in seconds
}
