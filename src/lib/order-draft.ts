import type { BookingSelectionData } from "@/lib/types";

export const ORDER_DRAFT_STORAGE_KEY = "pakuvie.orderDraft";

export type OrderDraft = {
  name: string;
  phone: string;
  email: string;
  serviceType: string;
  pickupAddress: string;
  deliveryAddress: string;
  addresses: string;
  message: string;
  estimatedPriceVat0: number | null;
  estimatedPriceVatIncl: number | null;
  bookingSelection?: BookingSelectionData | null;
};
