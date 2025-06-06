
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Warehouse } from "@/hooks/use-warehouses";

interface WarehouseTableProps {
  warehouses: Warehouse[];
  onEdit: (warehouse: Warehouse) => void;
  onDelete: (warehouse: Warehouse) => void;
}

export function WarehouseTable({ warehouses, onEdit, onDelete }: WarehouseTableProps) {
  return (
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
              {warehouses.map((warehouse) => {
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
                          onClick={() => onEdit(warehouse)}
                        >
                          <span className="sr-only">Edit</span>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          onClick={() => onDelete(warehouse)}
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
  );
}
