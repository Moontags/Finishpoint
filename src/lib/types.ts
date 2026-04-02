export type ServiceCategory = "ajoneuvo" | "kappaletavara" | "projekti";

export type ProjektiTyyppi =
  | "tunti"
  | "pieni_muutto"
  | "suuri_muutto"
  | "kierratys_1"
  | "kierratys_lisa";

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
};

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
