/**
 * Product Stock Model
 * Represents inventory stock for a product
 */
export interface ProductStock {
  productId: string;
  availableStock: number;
  reservedStock: number;
  updatedAt: Date;
}

/**
 * Create Product Stock Input
 */
export interface CreateProductStockInput {
  productId: string;
  availableStock: number;
  reservedStock?: number;
}

/**
 * Update Stock Input
 */
export interface UpdateStockInput {
  productId: string;
  quantityChange: number;
  isReservation: boolean;
}
