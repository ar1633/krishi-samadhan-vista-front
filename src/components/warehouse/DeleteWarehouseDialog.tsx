
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Warehouse } from "@/hooks/use-warehouses";

interface DeleteWarehouseDialogProps {
  warehouse: Warehouse | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function DeleteWarehouseDialog({ warehouse, onClose, onConfirm }: DeleteWarehouseDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Error deleting warehouse:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={!!warehouse} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the warehouse "{warehouse?.name}"? 
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDelete}
            variant="destructive" 
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Warehouse"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
