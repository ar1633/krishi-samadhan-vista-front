
import { z } from "zod";

export const warehouseFormSchema = z.object({
  name: z.string().min(1, "Warehouse name is required"),
  location: z.string().min(1, "Location is required"),
  capacity: z.coerce.number().min(1, "Capacity must be greater than 0"),
  available: z.coerce.number().min(0, "Available space cannot be negative"),
}).refine((data) => data.available <= data.capacity, {
  message: "Available space cannot exceed total capacity",
  path: ["available"],
});

export type WarehouseFormData = z.infer<typeof warehouseFormSchema>;
