import { DatabaseConnection } from './infrastructure/database/DatabaseConnection';
import { RabbitMQConnection } from './infrastructure/messaging/RabbitMQConnection';
import { PostgresProductStockRepository } from './infrastructure/repositories/PostgresProductStockRepository';
import { RabbitMQEventPublisher } from './infrastructure/messaging/EventPublisher';
import { OrderCreatedConsumer } from './infrastructure/messaging/OrderCreatedConsumer';
import { InventoryService } from './application/services/InventoryService';
import { ExpressApp } from './presentation/ExpressApp';
import { logger } from './config/logger';
import { config } from './config/config';

/**
 * Application Entry Point
 * Follows Dependency Injection principle
 */
class Application {
  private expressApp: ExpressApp | null = null;

  async start(): Promise<void> {
    try {
      logger.info('Starting Inventory Service...');
      logger.info(`Environment: ${config.env}`);

      // Initialize database
      logger.info('Connecting to database...');
      const db = DatabaseConnection.getInstance();
      await db.initialize();

      // Initialize RabbitMQ
      logger.info('Connecting to RabbitMQ...');
      const rabbitmq = RabbitMQConnection.getInstance();
      await rabbitmq.connect();

      // Initialize repositories
      const productStockRepository = new PostgresProductStockRepository();

      // Initialize event publisher
      const eventPublisher = new RabbitMQEventPublisher();

      // Initialize services
      const inventoryService = new InventoryService(
        productStockRepository,
        eventPublisher
      );

      // Initialize message consumers
      const orderCreatedConsumer = new OrderCreatedConsumer(inventoryService);
      await orderCreatedConsumer.startConsuming();

      // Initialize and start Express app
      this.expressApp = new ExpressApp(inventoryService);
      this.expressApp.start();

      // Seed initial data (for testing)
      await this.seedInitialData(productStockRepository);

      logger.info('Inventory Service started successfully');
    } catch (error) {
      logger.error('Failed to start Inventory Service', error);
      process.exit(1);
    }
  }

  async stop(): Promise<void> {
    try {
      logger.info('Stopping Inventory Service...');

      await RabbitMQConnection.getInstance().close();
      await DatabaseConnection.getInstance().close();

      logger.info('Inventory Service stopped successfully');
      process.exit(0);
    } catch (error) {
      logger.error('Error stopping Inventory Service', error);
      process.exit(1);
    }
  }

  /**
   * Seed initial product stock data for testing
   */
  private async seedInitialData(repository: PostgresProductStockRepository): Promise<void> {
    try {
      logger.info('Seeding initial product stock data...');

      const testProducts = [
        {
          productId: 'a3c2b1d0-6b0e-4f2b-9c1a-2d3f4a5b6c7d',
          availableStock: 100,
        },
        {
          productId: 'b7e8c9d1-2f3a-4b5c-8d9e-1a2b3c4d5e6f',
          availableStock: 50,
        },
        {
          productId: 'c1d2e3f4-5a6b-7c8d-9e0f-1a2b3c4d5e6f',
          availableStock: 75,
        },
      ];

      for (const product of testProducts) {
        try {
          const existing = await repository.findByProductId(product.productId);
          if (!existing) {
            await repository.create(product);
            logger.info(`Created product stock: ${product.productId}`);
          }
        } catch (error) {
          logger.warn(`Product ${product.productId} may already exist`);
        }
      }

      logger.info('Initial data seeding completed');
    } catch (error) {
      logger.error('Error seeding initial data', error);
    }
  }
}

// Create and start application
const app = new Application();

// Graceful shutdown handlers
process.on('SIGINT', () => {
  logger.info('Received SIGINT signal');
  app.stop();
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM signal');
  app.stop();
});

// Start the application
app.start();
