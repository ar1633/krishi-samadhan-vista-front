
import { z } from "zod";

export const warehouseFormSchema = z.object({
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

export type WarehouseFormData = z.infer<typeof warehouseFormSchema>;
