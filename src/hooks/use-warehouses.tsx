
import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  capacity: number; // capacity in tons
  available: number; // available space in tons
  vendorId: string;
  createdAt: Date;
}

// Sample warehouses data
const sampleWarehouses: Warehouse[] = [
  {
    id: "w1",
    name: "Central Storage Facility",
    location: "Amritsar, Punjab",
    capacity: 5000,
    available: 3500,
    vendorId: "v1",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
  },
  {
    id: "w2",
    name: "East Side Grain Silo",
    location: "Ludhiana, Punjab",
    capacity: 2000,
    available: 500,
    vendorId: "v1",
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
  },
  {
    id: "w3",
    name: "Western Cold Storage",
    location: "Bathinda, Punjab",
    capacity: 1000,
    available: 800,
    vendorId: "v1",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
  },
];

interface WarehousesContextType {
  warehouses: Warehouse[];
  addWarehouse: (warehouse: Omit<Warehouse, "id" | "createdAt">) => Promise<void>;
  updateWarehouse: (id: string, data: Partial<Warehouse>) => Promise<void>;
  deleteWarehouse: (id: string) => Promise<void>;
  getWarehousesByVendorId: (vendorId: string) => Warehouse[];
}

const WarehousesContext = createContext<WarehousesContextType | undefined>(undefined);

export const WarehousesProvider = ({ children }: { children: ReactNode }) => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const { toast } = useToast();

  // Initialize with sample data
  useEffect(() => {
    const storedWarehouses = localStorage.getItem("krishiWarehouses");
    if (storedWarehouses) {
      try {
        const parsedWarehouses = JSON.parse(storedWarehouses, (key, value) => {
          if (key === "createdAt") {
            return new Date(value);
          }
          return value;
        });
        setWarehouses(parsedWarehouses);
      } catch (error) {
        console.error("Error parsing stored warehouses:", error);
        setWarehouses(sampleWarehouses);
        localStorage.setItem("krishiWarehouses", JSON.stringify(sampleWarehouses));
      }
    } else {
      setWarehouses(sampleWarehouses);
      localStorage.setItem("krishiWarehouses", JSON.stringify(sampleWarehouses));
    }
  }, []);

  const addWarehouse = async (warehouseData: Omit<Warehouse, "id" | "createdAt">) => {
    const newWarehouse: Warehouse = {
      ...warehouseData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
    };

    const updatedWarehouses = [newWarehouse, ...warehouses];
    setWarehouses(updatedWarehouses);
    localStorage.setItem("krishiWarehouses", JSON.stringify(updatedWarehouses));

    toast({
      title: "Warehouse added successfully",
      description: `${newWarehouse.name} has been added to your warehouses`,
    });
  };

  const updateWarehouse = async (id: string, data: Partial<Warehouse>) => {
    const updatedWarehouses = warehouses.map((w) => {
      if (w.id === id) {
        return { ...w, ...data };
      }
      return w;
    });

    setWarehouses(updatedWarehouses);
    localStorage.setItem("krishiWarehouses", JSON.stringify(updatedWarehouses));

    toast({
      title: "Warehouse updated successfully",
      description: "Your warehouse information has been updated",
    });
  };

  const deleteWarehouse = async (id: string) => {
    const warehouseToDelete = warehouses.find((w) => w.id === id);
    const updatedWarehouses = warehouses.filter((w) => w.id !== id);

    setWarehouses(updatedWarehouses);
    localStorage.setItem("krishiWarehouses", JSON.stringify(updatedWarehouses));

    toast({
      title: "Warehouse deleted",
      description: `${warehouseToDelete?.name} has been removed`,
    });
  };

  const getWarehousesByVendorId = (vendorId: string) => {
    return warehouses.filter((w) => w.vendorId === vendorId);
  };

  return (
    <WarehousesContext.Provider
      value={{
        warehouses,
        addWarehouse,
        updateWarehouse,
        deleteWarehouse,
        getWarehousesByVendorId,
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
