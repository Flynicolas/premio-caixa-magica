
import { useAuth } from '@/hooks/useAuth';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { useItemData } from './useItemManagement/useItemData';
import { useItemOperations } from './useItemManagement/useItemOperations';

export const useItemManagement = () => {
  const { user } = useAuth();
  const { isAdmin } = useAdminCheck();
  const { items, setItems, stats, loading, fetchItems, calculateStats } = useItemData(isAdmin);
  const { updateItem, createItem, deleteItem } = useItemOperations(items, setItems, calculateStats);

  return {
    items,
    stats,
    loading,
    isAdmin,
    updateItem,
    createItem,
    deleteItem,
    refetchItems: fetchItems
  };
};
