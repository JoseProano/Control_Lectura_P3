import express, { Application, Request, Response, NextFunction } from 'express';
import { config } from '../config/config';
import { logger } from '../config/logger';
import { setupProductStockRoutes } from './ProductStockController';
import { InventoryService } from '../application/services/InventoryService';

/**
 * Express Application Setup
 * Follows Single Responsibility Principle: Only configures Express app
 */
export class ExpressApp {
  private app: Application;

  constructor(private inventoryService: InventoryService) {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Request logging middleware
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      logger.info(`${req.method} ${req.path}`, {
        query: req.query,
        body: req.body,
      });
      next();
    });
  }

  private setupRoutes(): void {
    const apiRouter = express.Router();

    // Health check endpoint
    apiRouter.get('/health', (req: Request, res: Response) => {
      res.status(200).json({
        status: 'healthy',
        service: 'inventory-service',
        timestamp: new Date().toISOString(),
      });
    });

    // Product stock routes
    setupProductStockRoutes(apiRouter, this.inventoryService);

    // Mount API router
    this.app.use('/api/v1', apiRouter);

    // 404 handler
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
      });
    });
  }

  private setupErrorHandling(): void {
    this.app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      logger.error('Error handling request', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
      });

      res.status(500).json({
        error: 'Internal Server Error',
        message: err.message || 'An unexpected error occurred',
      });
    });
  }

  public getApp(): Application {
    return this.app;
  }

  public start(): void {
    this.app.listen(config.port, () => {
      logger.info(`Inventory Service listening on port ${config.port}`);
    });
  }
}
