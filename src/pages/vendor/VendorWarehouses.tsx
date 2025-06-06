
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2 } from "lucide-react";

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

export default function VendorWarehouses() {
  const { user } = useAuth();
  const { warehouses, addWarehouse, updateWarehouse, deleteWarehouse } = useWarehouses();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Capacity (tons)</TableHead>
                    <TableHead className="text-right">Used (tons)</TableHead>
                    <TableHead className="text-right">Available (tons)</TableHead>
                    <TableHead className="text-right">Utilization</TableHead>
                    <TableHead className="text-right">Added On</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedWarehouses.map((warehouse) => {
                    const utilisationPercentage = Math.round(((warehouse.capacity - warehouse.available) / warehouse.capacity) * 100);
                    const usedSpace = warehouse.capacity - warehouse.available;
                    
                    return (
                      <TableRow key={warehouse.id}>
                        <TableCell className="font-medium">{warehouse.name}</TableCell>
                        <TableCell>{warehouse.location}</TableCell>
                        <TableCell className="text-right">{warehouse.capacity.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{usedSpace.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{warehouse.available.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="inline-block w-24 mr-2">
                            <Progress value={utilisationPercentage} className="h-2" />
                          </div>
                          {utilisationPercentage}%
                        </TableCell>
                        <TableCell className="text-right">
                          {format(new Date(warehouse.createdAt), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 w-8 p-0"
                              onClick={() => handleOpenModal(warehouse)}
                            >
                              <span className="sr-only">Edit</span>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                              onClick={() => openDeleteConfirm(warehouse)}
                            >
                              <span className="sr-only">Delete</span>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
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
