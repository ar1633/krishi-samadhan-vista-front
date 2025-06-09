
import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  capacity: number;
  available: number;
  vendor_id: string;
  created_at: string;
}

interface WarehousesContextType {
  warehouses: Warehouse[];
  loading: boolean;
  addWarehouse: (warehouse: Omit<Warehouse, "id" | "created_at" | "vendor_id">) => Promise<void>;
  updateWarehouse: (id: string, data: Partial<Warehouse>) => Promise<void>;
  deleteWarehouse: (id: string) => Promise<void>;
  getWarehousesByVendorId: (vendorId: string) => Warehouse[];
  refreshWarehouses: () => Promise<void>;
}

const WarehousesContext = createContext<WarehousesContextType | undefined>(undefined);

export const WarehousesProvider = ({ children }: { children: ReactNode }) => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchWarehouses = async () => {
    try {
      const { data, error } = await supabase
        .from('warehouses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setWarehouses(data || []);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      toast({
        title: "Error",
        description: "Failed to load warehouses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('warehouses_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'warehouses' }, () => {
        fetchWarehouses();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const addWarehouse = async (warehouseData: Omit<Warehouse, "id" | "created_at" | "vendor_id">) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { error } = await supabase
      .from('warehouses')
      .insert({
        ...warehouseData,
        vendor_id: user.id,
      });

    if (error) throw error;

    toast({
      title: "Warehouse added successfully",
      description: `${warehouseData.name} has been added to your warehouses`,
    });

    await fetchWarehouses();
  };

  const updateWarehouse = async (id: string, data: Partial<Warehouse>) => {
    const { error } = await supabase
      .from('warehouses')
      .update(data)
      .eq('id', id);

    if (error) throw error;

    toast({
      title: "Warehouse updated successfully",
      description: "Your warehouse information has been updated",
    });

    await fetchWarehouses();
  };

  const deleteWarehouse = async (id: string) => {
    const { error } = await supabase
      .from('warehouses')
      .delete()
      .eq('id', id);

    if (error) throw error;

    toast({
      title: "Warehouse deleted",
      description: "Warehouse has been removed",
    });

    await fetchWarehouses();
  };

  const getWarehousesByVendorId = (vendorId: string) => {
    return warehouses.filter((w) => w.vendor_id === vendorId);
  };

  const refreshWarehouses = async () => {
    await fetchWarehouses();
  };

  return (
    <WarehousesContext.Provider
      value={{
        warehouses,
        loading,
        addWarehouse,
        updateWarehouse,
        deleteWarehouse,
        getWarehousesByVendorId,
        refreshWarehouses,
      }}
    >
      {children}
    </WarehousesContext.Provider>
  );
};

export const useWarehouses = () => {
  const context = useContext(WarehousesContext);
  if (context === undefined) {
    throw new Error("useWarehouses must be used within a WarehousesProvider");
  }
  return context;
};
