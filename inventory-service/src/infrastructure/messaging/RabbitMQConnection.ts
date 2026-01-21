import * as amqp from 'amqplib';
import { config } from '../../config/config';
import { logger } from '../../config/logger';

/**
 * RabbitMQ Connection Manager
 * Follows Single Responsibility Principle: Only manages RabbitMQ connections
 */
export class RabbitMQConnection {
  private static instance: RabbitMQConnection;
  private connection: any = null;
  private channel: amqp.Channel | null = null;

  private constructor() {}

  public static getInstance(): RabbitMQConnection {
    if (!RabbitMQConnection.instance) {
      RabbitMQConnection.instance = new RabbitMQConnection();
    }
    return RabbitMQConnection.instance;
  }

  public async connect(): Promise<void> {
    try {
      const conn: any = await amqp.connect(config.rabbitmq.url);
      this.connection = conn;
      const ch: any = await conn.createChannel();
      this.channel = ch;

      logger.info('Connected to RabbitMQ successfully');

      // Setup connection error handlers
      conn.on('error', (err: Error) => {
        logger.error('RabbitMQ connection error', err);
      });

      conn.on('close', () => {
        logger.warn('RabbitMQ connection closed');
      });

      // Setup exchange and queues
      await this.setupInfrastructure();
    } catch (error) {
      logger.error('Failed to connect to RabbitMQ', error);
      throw error;
    }
  }

  private async setupInfrastructure(): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel not initialized');
    }

    try {
      // Assert exchange
      await this.channel.assertExchange(config.rabbitmq.exchange, 'topic', {
        durable: true,
      });

      // Assert queues
      await this.channel.assertQueue(config.rabbitmq.queues.orderCreated, {
        durable: true,
      });

      await this.channel.assertQueue(config.rabbitmq.queues.stockResponse, {
        durable: true,
      });

      // Bind queues to exchange
      await this.channel.bindQueue(
        config.rabbitmq.queues.orderCreated,
        config.rabbitmq.exchange,
        config.rabbitmq.routingKeys.orderCreated
      );

      await this.channel.bindQueue(
        config.rabbitmq.queues.stockResponse,
        config.rabbitmq.exchange,
        config.rabbitmq.routingKeys.stockReserved
      );

      await this.channel.bindQueue(
        config.rabbitmq.queues.stockResponse,
        config.rabbitmq.exchange,
        config.rabbitmq.routingKeys.stockRejected
      );

      logger.info('RabbitMQ infrastructure setup completed');
    } catch (error) {
      logger.error('Failed to setup RabbitMQ infrastructure', error);
      throw error;
    }
  }

  public getChannel(): amqp.Channel {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }
    return this.channel;
  }

  public async close(): Promise<void> {
    try {
      if (this.channel) {
        await (this.channel as any).close();
      }
      if (this.connection) {
        await (this.connection as any).close();
      }
      logger.info('RabbitMQ connection closed');
    } catch (error) {
      logger.error('Error closing RabbitMQ connection', error);
      throw error;
    }
  }
}
