import { Channel, ConsumeMessage } from 'amqplib';
import { RabbitMQConnection } from './RabbitMQConnection';
import { OrderCreatedEvent } from './events';
import { InventoryService } from '../../application/services/InventoryService';
import { config } from '../../config/config';
import { logger } from '../../config/logger';

/**
 * Order Created Event Consumer
 * Follows Single Responsibility Principle: Only consumes OrderCreated events
 */
export class OrderCreatedConsumer {
  private channel: Channel;
  private inventoryService: InventoryService;

  constructor(inventoryService: InventoryService) {
    this.channel = RabbitMQConnection.getInstance().getChannel();
    this.inventoryService = inventoryService;
  }

  async startConsuming(): Promise<void> {
    try {
      await this.channel.prefetch(1); // Process one message at a time

      this.channel.consume(
        config.rabbitmq.queues.orderCreated,
        async (msg: ConsumeMessage | null) => {
          if (msg) {
            await this.handleMessage(msg);
          }
        },
        { noAck: false }
      );

      logger.info('Started consuming OrderCreated events');
    } catch (error) {
      logger.error('Failed to start consuming OrderCreated events', error);
      throw error;
    }
  }

  private async handleMessage(msg: ConsumeMessage): Promise<void> {
    try {
      const content = msg.content.toString();
      logger.info('Received OrderCreated event', { content });

      const event: OrderCreatedEvent = JSON.parse(content);

      // Process the order
      await this.inventoryService.processOrder(event);

      // Acknowledge the message
      this.channel.ack(msg);
      logger.info('Successfully processed OrderCreated event', { orderId: event.orderId });
    } catch (error) {
      logger.error('Failed to process OrderCreated event', { error });
      
      // Reject and requeue the message (with a limit to avoid infinite loops)
      this.channel.nack(msg, false, false);
    }
  }
}
