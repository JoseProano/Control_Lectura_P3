import dotenv from 'dotenv';

dotenv.config();

/**
 * Application Configuration
 * Follows Single Responsibility Principle: Only manages configuration
 */
export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'inventorydb',
    user: process.env.DB_USER || 'inventoryuser',
    password: process.env.DB_PASSWORD || 'inventorypass',
  },
  
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672',
    exchange: process.env.RABBITMQ_EXCHANGE || 'ecommerce.events',
    queues: {
      orderCreated: process.env.RABBITMQ_ORDER_CREATED_QUEUE || 'order.created',
      stockResponse: process.env.RABBITMQ_STOCK_RESPONSE_QUEUE || 'stock.response',
    },
    routingKeys: {
      orderCreated: process.env.RABBITMQ_ORDER_CREATED_ROUTING_KEY || 'order.created',
      stockReserved: process.env.RABBITMQ_STOCK_RESERVED_ROUTING_KEY || 'stock.reserved',
      stockRejected: process.env.RABBITMQ_STOCK_REJECTED_ROUTING_KEY || 'stock.rejected',
    },
  },
};
