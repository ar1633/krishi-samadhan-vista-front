
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heading, Text } from "@/components/ui/typography";
import { useWarehouses, Warehouse } from "@/hooks/use-warehouses";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { WarehouseTable } from "@/components/warehouse/WarehouseTable";
import { WarehouseFormModal } from "@/components/warehouse/WarehouseFormModal";
import { DeleteWarehouseDialog } from "@/components/warehouse/DeleteWarehouseDialog";
import { WarehouseFormData } from "@/types/warehouse";

export default function VendorWarehouses() {
  const { user } = useAuth();
  const { warehouses, addWarehouse, updateWarehouse, deleteWarehouse } = useWarehouses();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editWarehouse, setEditWarehouse] = useState<Warehouse | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Warehouse | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const vendorId = user?.id || "";
  const vendorWarehouses = user 
    ? warehouses.filter(w => w.vendorId === vendorId)
    : [];
    
  // Filter warehouses based on search term
  const filteredWarehouses = vendorWarehouses.filter(warehouse => 
    warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warehouse.location.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Sort by newest first
  const sortedWarehouses = [...filteredWarehouses].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  const handleOpenModal = (warehouse?: Warehouse) => {
    setEditWarehouse(warehouse || null);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditWarehouse(null);
  };
  
  const openDeleteConfirm = (warehouse: Warehouse) => {
    setShowDeleteConfirm(warehouse);
  };
  
  const closeDeleteConfirm = () => {
    setShowDeleteConfirm(null);
  };
  
  const handleDelete = async () => {
    if (!showDeleteConfirm) return;
    await deleteWarehouse(showDeleteConfirm.id);
  };
  
  const handleFormSubmit = async (data: WarehouseFormData) => {
    if (!user) return;
    
    // Ensure available space doesn't exceed capacity
    const available = Math.min(data.available, data.capacity);
    
    if (editWarehouse) {
      await updateWarehouse(editWarehouse.id, {
        ...data,
        available,
      });
    } else {
      await addWarehouse({
        name: data.name,
        location: data.location,
        capacity: data.capacity,
        available,
        vendorId: user.id,
      });
    }
  };

  return (
    <div className="page-container">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <Heading as="h1" size="xl" className="text-earth-800">Warehouse Management</Heading>
        
        <Button 
          className="bg-earth-700 hover:bg-earth-800"
          onClick={() => handleOpenModal()}
        >
          Add New Warehouse
        </Button>
      </div>
      
      {/* Search Box */}
      <div className="mb-6">
        <Input
          placeholder="Search warehouses by name or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xl"
        />
      </div>
      
      {/* Warehouses Table */}
      {sortedWarehouses.length > 0 ? (
        <WarehouseTable 
          warehouses={sortedWarehouses}
          onEdit={handleOpenModal}
          onDelete={openDeleteConfirm}
        />
      ) : (
        <Card className="border-dashed border-2 p-6">
          <div className="text-center py-8">
            <Text variant="muted" className="mb-4">
              No warehouses found.
            </Text>
            <Button 
              className="bg-earth-700 hover:bg-earth-800"
              onClick={() => handleOpenModal()}
            >
              Add Your First Warehouse
            </Button>
          </div>
        </Card>
      )}
      
      {/* Warehouse Form Modal */}
      <WarehouseFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        editWarehouse={editWarehouse}
      />
      
      {/* Delete Confirmation Dialog */}
      <DeleteWarehouseDialog
        warehouse={showDeleteConfirm}
        onClose={closeDeleteConfirm}
        onConfirm={handleDelete}
      />
    </div>
  );
}
