import { IProductStockRepository } from '../../domain/repositories/IProductStockRepository';
import { IEventPublisher } from '../../infrastructure/messaging/EventPublisher';
import { OrderCreatedEvent, StockReservedEvent, StockRejectedEvent } from '../../infrastructure/messaging/events';
import { logger } from '../../config/logger';

/**
 * Inventory Service
 * Follows Single Responsibility Principle: Manages inventory business logic
 * Follows Dependency Inversion Principle: Depends on abstractions
 */
export class InventoryService {
  constructor(
    private productStockRepository: IProductStockRepository,
    private eventPublisher: IEventPublisher
  ) {}

  /**
   * Process order and check stock availability
   */
  async processOrder(event: OrderCreatedEvent): Promise<void> {
    logger.info('Processing order', { orderId: event.orderId });

    try {
      // Check if all items have sufficient stock
      const stockCheckResults = await Promise.all(
        event.items.map(async (item) => {
          const hasStock = await this.productStockRepository.hasAvailableStock(
            item.productId,
            item.quantity
          );
          return { productId: item.productId, hasStock };
        })
      );

      // Find any items with insufficient stock
      const insufficientStockItem = stockCheckResults.find((result) => !result.hasStock);

      if (insufficientStockItem) {
        // Stock insufficient - publish rejection event
        await this.publishStockRejected(
          event.orderId,
          event.correlationId,
          `Insufficient stock for product ${insufficientStockItem.productId}`
        );
        return;
      }

      // Reserve stock for all items
      const reservationResults = await Promise.all(
        event.items.map(async (item) => {
          const reserved = await this.productStockRepository.reserveStock(
            item.productId,
            item.quantity
          );
          return { productId: item.productId, reserved };
        })
      );

      // Check if all reservations succeeded
      const failedReservation = reservationResults.find((result) => !result.reserved);

      if (failedReservation) {
        // Reservation failed - publish rejection event
        await this.publishStockRejected(
          event.orderId,
          event.correlationId,
          `Failed to reserve stock for product ${failedReservation.productId}`
        );
        return;
      }

      // All reservations successful - publish success event
      await this.publishStockReserved(event);
      
    } catch (error) {
      logger.error('Error processing order', { orderId: event.orderId, error });
      
      // Publish rejection event on error
      await this.publishStockRejected(
        event.orderId,
        event.correlationId,
        'Internal error while processing stock reservation'
      );
    }
  }

  /**
   * Publish StockReserved event
   */
  private async publishStockReserved(orderEvent: OrderCreatedEvent): Promise<void> {
    const event: StockReservedEvent = {
      eventType: 'StockReserved',
      orderId: orderEvent.orderId,
      correlationId: orderEvent.correlationId,
      reservedItems: orderEvent.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      reservedAt: Date.now() / 1000, // Unix timestamp in seconds (compatible with Java Instant)
    };

    await this.eventPublisher.publishStockReserved(event);
  }

  /**
   * Publish StockRejected event
   */
  private async publishStockRejected(
    orderId: string,
    correlationId: string,
    reason: string
  ): Promise<void> {
    const event: StockRejectedEvent = {
      eventType: 'StockRejected',
      orderId,
      correlationId,
      reason,
      rejectedAt: Date.now() / 1000, // Unix timestamp in seconds (compatible with Java Instant)
    };

    await this.eventPublisher.publishStockRejected(event);
  }

  /**
   * Get product stock information
   */
  async getProductStock(productId: string) {
    const stock = await this.productStockRepository.findByProductId(productId);
    
    if (!stock) {
      throw new Error(`Product stock not found: ${productId}`);
    }

    return stock;
  }
}
