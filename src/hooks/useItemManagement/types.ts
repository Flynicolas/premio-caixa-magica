
export interface ItemManagementStats {
  totalItems: number;
  itemsByChest: Record<string, number>;
  itemsByRarity: Record<string, number>;
  totalValue: number;
  missingImages: number;
}
