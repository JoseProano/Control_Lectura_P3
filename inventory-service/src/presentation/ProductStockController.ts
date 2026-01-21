import express, { Request, Response, NextFunction } from 'express';
import { InventoryService } from '../application/services/InventoryService';
import { logger } from '../config/logger';

/**
 * Product Stock Controller
 * Follows Single Responsibility Principle: Only handles HTTP requests/responses
 */
export class ProductStockController {
  constructor(private inventoryService: InventoryService) {}

  /**
   * GET /api/v1/products/:productId/stock
   * Get stock information for a product
   */
  async getProductStock(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { productId } = req.params;
      
      logger.info('Get product stock request', { productId });

      const stock = await this.inventoryService.getProductStock(productId);

      res.status(200).json({
        productId: stock.productId,
        availableStock: stock.availableStock,
        reservedStock: stock.reservedStock,
        updatedAt: stock.updatedAt.toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}

/**
 * Setup product stock routes
 */
export function setupProductStockRoutes(
  router: express.Router,
  inventoryService: InventoryService
): void {
  const controller = new ProductStockController(inventoryService);

  router.get(
    '/products/:productId/stock',
    controller.getProductStock.bind(controller)
  );
}
