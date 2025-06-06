
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Heading, Text } from "@/components/ui/typography";
import { useWarehouses, Warehouse } from "@/hooks/use-warehouses";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";

const formSchema = z.object({
  name: z.string()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must be less than 100 characters"),
  location: z.string()
    .min(3, "Location must be at least 3 characters")
    .max(100, "Location must be less than 100 characters"),
  capacity: z.coerce.number()
    .min(1, "Capacity must be at least 1 ton")
    .max(100000, "Capacity must be less than 100,000 tons"),
  available: z.coerce.number()
    .min(0, "Available space cannot be negative"),
});

type FormData = z.infer<typeof formSchema>;

export default function VendorDashboard() {
  const { user } = useAuth();
  const { warehouses, addWarehouse, updateWarehouse, deleteWarehouse } = useWarehouses();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editWarehouse, setEditWarehouse] = useState<Warehouse | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Warehouse | null>(null);
  
  const vendorId = user?.id || "";
  const vendorWarehouses = user 
    ? warehouses.filter(w => w.vendorId === vendorId)
    : [];
    
  const totalCapacity = vendorWarehouses.reduce((sum, w) => sum + w.capacity, 0);
  const totalAvailable = vendorWarehouses.reduce((sum, w) => sum + w.available, 0);
  const utilizationPercentage = totalCapacity > 0 
    ? Math.round(((totalCapacity - totalAvailable) / totalCapacity) * 100) 
    : 0;
    
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      location: "",
      capacity: 0,
      available: 0,
    },
  });
  
  const handleOpenModal = (warehouse?: Warehouse) => {
    if (warehouse) {
      setEditWarehouse(warehouse);
      form.reset({
        name: warehouse.name,
        location: warehouse.location,
        capacity: warehouse.capacity,
        available: warehouse.available,
      });
    } else {
      setEditWarehouse(null);
      form.reset({
        name: "",
        location: "",
        capacity: 0,
        available: 0,
      });
    }
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
    
    try {
      setIsSubmitting(true);
      await deleteWarehouse(showDeleteConfirm.id);
      closeDeleteConfirm();
    } catch (error) {
      console.error("Error deleting warehouse:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const onSubmit = async (data: FormData) => {
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      
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
      
      handleCloseModal();
    } catch (error) {
      console.error("Error saving warehouse:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <Heading as="h1" size="xl" className="text-krishi-800">Vendor Dashboard</Heading>
        
        <Button 
          className="bg-earth-700 hover:bg-earth-800"
          onClick={() => handleOpenModal()}
        >
          Add New Warehouse
        </Button>
      </div>
      
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <Card className="border-earth-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-earth-700">Total Warehouses</CardTitle>
          </CardHeader>
          <CardContent>
            <Text size="4xl" className="font-bold text-earth-600">{vendorWarehouses.length}</Text>
            <Text variant="muted">Locations managed</Text>
          </CardContent>
        </Card>
        
        <Card className="border-earth-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-earth-700">Storage Capacity</CardTitle>
          </CardHeader>
          <CardContent>
            <Text size="4xl" className="font-bold text-earth-600">{totalCapacity.toLocaleString()}</Text>
            <Text variant="muted">Total tons</Text>
          </CardContent>
        </Card>
        
        <Card className="border-earth-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-earth-700">Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <Text size="4xl" className="font-bold text-earth-600">{utilizationPercentage}%</Text>
            <Progress value={utilizationPercentage} className="h-2 mt-2" />
            <Text variant="muted" className="mt-1">
              {totalCapacity - totalAvailable} of {totalCapacity} tons used
            </Text>
          </CardContent>
        </Card>
      </div>
      
      {/* Warehouses List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <Heading as="h2" size="lg" className="text-earth-700">My Warehouses</Heading>
          <Link to="/vendor/warehouses" className="text-earth-600 hover:underline">
            Manage All
          </Link>
        </div>
        
        {vendorWarehouses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendorWarehouses.map((warehouse) => {
              const utilisationPercentage = Math.round(((warehouse.capacity - warehouse.available) / warehouse.capacity) * 100);
              
              return (
                <Card key={warehouse.id} className="border-earth-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <Text className="font-semibold text-lg">{warehouse.name}</Text>
                      <div className="flex space-x-1">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleOpenModal(warehouse)}
                        >
                          <span className="sr-only">Edit</span>
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 20 20" 
                            fill="currentColor" 
                            className="w-4 h-4"
                          >
                            <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
                            <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
                          </svg>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          onClick={() => openDeleteConfirm(warehouse)}
                        >
                          <span className="sr-only">Delete</span>
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 20 20" 
                            fill="currentColor" 
                            className="w-4 h-4"
                          >
                            <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                    
                    <Text size="sm" variant="muted" className="mb-3">
                      <span className="inline-block mr-2">📍</span> 
                      {warehouse.location}
                    </Text>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Text size="sm">Utilization:</Text>
                        <Text size="sm" className="font-medium">{utilisationPercentage}%</Text>
                      </div>
                      
                      <Progress value={utilisationPercentage} className="h-2" />
                      
                      <div className="flex justify-between items-center text-sm">
                        <Text size="sm" variant="muted">
                          Available: {warehouse.available} tons
                        </Text>
                        <Text size="sm" variant="muted">
                          Capacity: {warehouse.capacity} tons
                        </Text>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="border-dashed border-2 p-6">
            <div className="text-center py-8">
              <Text variant="muted" className="mb-4">
                You haven't added any warehouses yet.
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
      </div>
      
      {/* Warehouse Form Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editWarehouse ? "Edit Warehouse" : "Add New Warehouse"}
            </DialogTitle>
            <DialogDescription>
              {editWarehouse 
                ? "Update the details of your existing warehouse."
                : "Enter the details for your new warehouse location."}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Warehouse Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Central Storage Facility" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Ludhiana, Punjab" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Capacity (tons)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="available"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Available Space (tons)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-earth-700 hover:bg-earth-800" 
                  disabled={isSubmitting}
                >
                  {isSubmitting 
                    ? (editWarehouse ? "Updating..." : "Adding...") 
                    : (editWarehouse ? "Update Warehouse" : "Add Warehouse")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!showDeleteConfirm} onOpenChange={closeDeleteConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the warehouse "{showDeleteConfirm?.name}"? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={closeDeleteConfirm}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDelete}
              variant="destructive" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Delete Warehouse"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
