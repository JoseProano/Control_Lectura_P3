import { ProductStock, CreateProductStockInput, UpdateStockInput } from '../models/ProductStock';

/**
 * Product Stock Repository Interface
 * Follows Interface Segregation Principle and Dependency Inversion Principle
 */
export interface IProductStockRepository {
  /**
   * Find product stock by product ID
   */
  findByProductId(productId: string): Promise<ProductStock | null>;

  /**
   * Create new product stock entry
   */
  create(input: CreateProductStockInput): Promise<ProductStock>;

  /**
   * Update stock levels
   */
  updateStock(input: UpdateStockInput): Promise<ProductStock>;

  /**
   * Check if sufficient stock is available
   */
  hasAvailableStock(productId: string, quantity: number): Promise<boolean>;

  /**
   * Reserve stock for an order
   */
  reserveStock(productId: string, quantity: number): Promise<boolean>;

  /**
   * Get all products with stock
   */
  findAll(): Promise<ProductStock[]>;
}
