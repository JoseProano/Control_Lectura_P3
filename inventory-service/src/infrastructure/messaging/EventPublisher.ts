import { Channel } from 'amqplib';
import { RabbitMQConnection } from './RabbitMQConnection';
import { StockReservedEvent, StockRejectedEvent } from './events';
import { config } from '../../config/config';
import { logger } from '../../config/logger';

/**
 * Event Publisher Interface
 * Follows Interface Segregation Principle
 */
export interface IEventPublisher {
  publishStockReserved(event: StockReservedEvent): Promise<void>;
  publishStockRejected(event: StockRejectedEvent): Promise<void>;
}

/**
 * RabbitMQ Event Publisher
 * Follows Single Responsibility Principle: Only publishes events to RabbitMQ
 */
export class RabbitMQEventPublisher implements IEventPublisher {
  private channel: Channel;

  constructor() {
    this.channel = RabbitMQConnection.getInstance().getChannel();
  }

  async publishStockReserved(event: StockReservedEvent): Promise<void> {
    try {
      const message = JSON.stringify(event);
      
      logger.info('Publishing StockReserved event', { 
        orderId: event.orderId, 
        exchange: config.rabbitmq.exchange,
        routingKey: config.rabbitmq.routingKeys.stockReserved,
        message: message
      });
      
      const published = this.channel.publish(
        config.rabbitmq.exchange,
        config.rabbitmq.routingKeys.stockReserved,
        Buffer.from(message),
        {
          persistent: true,
          contentType: 'application/json',
        }
      );

      logger.info('Published StockReserved event', { orderId: event.orderId, published });
    } catch (error) {
      logger.error('Failed to publish StockReserved event', { event, error });
      throw error;
    }
  }

  async publishStockRejected(event: StockRejectedEvent): Promise<void> {
    try {
      const message = JSON.stringify(event);
      
      this.channel.publish(
        config.rabbitmq.exchange,
        config.rabbitmq.routingKeys.stockRejected,
        Buffer.from(message),
        {
          persistent: true,
          contentType: 'application/json',
        }
      );

      logger.info('Published StockRejected event', { orderId: event.orderId });
    } catch (error) {
      logger.error('Failed to publish StockRejected event', { event, error });
      throw error;
    }
  }
}
