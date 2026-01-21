import { Pool } from 'pg';
import { IProductStockRepository } from '../../domain/repositories/IProductStockRepository';
import { ProductStock, CreateProductStockInput, UpdateStockInput } from '../../domain/models/ProductStock';
import { DatabaseConnection } from '../database/DatabaseConnection';
import { logger } from '../../config/logger';

/**
 * PostgreSQL Product Stock Repository Implementation
 * Follows Single Responsibility Principle: Only handles database operations for product stock
 * Follows Dependency Inversion Principle: Implements interface abstraction
 */
export class PostgresProductStockRepository implements IProductStockRepository {
  private pool: Pool;

  constructor() {
    this.pool = DatabaseConnection.getInstance().getPool();
  }

  async findByProductId(productId: string): Promise<ProductStock | null> {
    try {
      const result = await this.pool.query(
        'SELECT product_id, available_stock, reserved_stock, updated_at FROM products_stock WHERE product_id = $1',
        [productId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToProductStock(result.rows[0]);
    } catch (error) {
      logger.error('Error finding product stock', { productId, error });
      throw error;
    }
  }

  async create(input: CreateProductStockInput): Promise<ProductStock> {
    try {
      const result = await this.pool.query(
        `INSERT INTO products_stock (product_id, available_stock, reserved_stock, updated_at)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
         RETURNING product_id, available_stock, reserved_stock, updated_at`,
        [input.productId, input.availableStock, input.reservedStock || 0]
      );

      return this.mapRowToProductStock(result.rows[0]);
    } catch (error) {
      logger.error('Error creating product stock', { input, error });
      throw error;
    }
  }

  async updateStock(input: UpdateStockInput): Promise<ProductStock> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      const currentStock = await client.query(
        'SELECT available_stock, reserved_stock FROM products_stock WHERE product_id = $1 FOR UPDATE',
        [input.productId]
      );

      if (currentStock.rows.length === 0) {
        throw new Error(`Product stock not found: ${input.productId}`);
      }

      let newAvailableStock = currentStock.rows[0].available_stock;
      let newReservedStock = currentStock.rows[0].reserved_stock;

      if (input.isReservation) {
        newAvailableStock -= input.quantityChange;
        newReservedStock += input.quantityChange;
      } else {
        newAvailableStock += input.quantityChange;
      }

      const result = await client.query(
        `UPDATE products_stock 
         SET available_stock = $1, reserved_stock = $2, updated_at = CURRENT_TIMESTAMP
         WHERE product_id = $3
         RETURNING product_id, available_stock, reserved_stock, updated_at`,
        [newAvailableStock, newReservedStock, input.productId]
      );

      await client.query('COMMIT');
      return this.mapRowToProductStock(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error updating product stock', { input, error });
      throw error;
    } finally {
      client.release();
    }
  }

  async hasAvailableStock(productId: string, quantity: number): Promise<boolean> {
    try {
      const result = await this.pool.query(
        'SELECT available_stock FROM products_stock WHERE product_id = $1',
        [productId]
      );

      if (result.rows.length === 0) {
        return false;
      }

      return result.rows[0].available_stock >= quantity;
    } catch (error) {
      logger.error('Error checking available stock', { productId, quantity, error });
      throw error;
    }
  }

  async reserveStock(productId: string, quantity: number): Promise<boolean> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      const result = await client.query(
        'SELECT available_stock FROM products_stock WHERE product_id = $1 FOR UPDATE',
        [productId]
      );

      if (result.rows.length === 0 || result.rows[0].available_stock < quantity) {
        await client.query('ROLLBACK');
        return false;
      }

      await client.query(
        `UPDATE products_stock 
         SET available_stock = available_stock - $1, 
             reserved_stock = reserved_stock + $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE product_id = $2`,
        [quantity, productId]
      );

      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error reserving stock', { productId, quantity, error });
      throw error;
    } finally {
      client.release();
    }
  }

  async findAll(): Promise<ProductStock[]> {
    try {
      const result = await this.pool.query(
        'SELECT product_id, available_stock, reserved_stock, updated_at FROM products_stock ORDER BY updated_at DESC'
      );

      return result.rows.map((row: any) => this.mapRowToProductStock(row));
    } catch (error) {
      logger.error('Error finding all product stocks', error);
      throw error;
    }
  }

  private mapRowToProductStock(row: any): ProductStock {
    return {
      productId: row.product_id,
      availableStock: parseInt(row.available_stock, 10),
      reservedStock: parseInt(row.reserved_stock, 10),
      updatedAt: new Date(row.updated_at),
    };
  }
}
