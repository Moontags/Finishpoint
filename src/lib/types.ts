export type ServiceCategory = "ajoneuvo" | "kappaletavara" | "projekti";

// Kierrätys on oma pääpalvelunsa (/kierratys) ja tarjouspohjainen, joten se ei
// enää ole muuttolaskurin alavalinta eikä osa projektihinnoittelua.
export type ProjektiTyyppi = "tunti" | "pieni_muutto" | "suuri_muutto";

export type OrderData = {
  orderId: string;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress?: string;
  serviceDescription: string;
  pickupAddress: string;
  deliveryAddress: string;
  totalWithVat: number;
  vatRate: number;
  vatAmount: number;
  netAmount: number;
  paymentMethod: "mobilepay" | "invoice";
  vippsReference?: string;
  emailDeliveryStatus?: EmailDeliveryStatus;
  emailDeliveryError?: string;
  bookingSelection?: BookingSelectionData | null;
};

export type EmailDeliveryStatus = "pending" | "sent" | "failed";

export type QuoteRequestData = {
  name: string;
  phone: string;
  email: string;
  serviceType: string;
  addresses: string;
  message: string;
  source: "website";
  status: "received";
};

export type BookingSelectionData = {
  reservationDate: string;
  arrivalTime: string;
  riihimakiDepartureTime: string;
  releaseTime: string;
  driveToDestinationMinutes: number;
  driveFromRiihimakiMinutes: number;
  workDurationMinutes: number;
  calendarBlockMinutes: number;
};
