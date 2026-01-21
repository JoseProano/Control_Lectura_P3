import { Pool, PoolClient } from 'pg';
import { config } from '../../config/config';
import { logger } from '../../config/logger';

/**
 * Database Connection Manager
 * Follows Single Responsibility Principle: Only manages database connections
 */
export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private pool: Pool;

  private constructor() {
    this.pool = new Pool({
      host: config.database.host,
      port: config.database.port,
      database: config.database.name,
      user: config.database.user,
      password: config.database.password,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    this.pool.on('error', (err: Error) => {
      logger.error('Unexpected database error', err);
    });
  }

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public getPool(): Pool {
    return this.pool;
  }

  public async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  public async initialize(): Promise<void> {
    try {
      const client = await this.pool.connect();
      
      // Create products_stock table if not exists
      await client.query(`
        CREATE TABLE IF NOT EXISTS products_stock (
          product_id UUID PRIMARY KEY,
          available_stock INTEGER NOT NULL DEFAULT 0,
          reserved_stock INTEGER NOT NULL DEFAULT 0,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_products_stock_updated_at 
        ON products_stock(updated_at);
      `);

      logger.info('Database initialized successfully');
      client.release();
    } catch (error) {
      logger.error('Failed to initialize database', error);
      throw error;
    }
  }

  public async close(): Promise<void> {
    await this.pool.end();
    logger.info('Database connection closed');
  }
}
