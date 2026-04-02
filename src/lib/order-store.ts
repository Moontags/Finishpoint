import type { OrderData } from "@/lib/types";

const orderById = new Map<string, OrderData>();

export async function saveOrder(order: OrderData) {
  orderById.set(order.orderId, order);
}

export async function getOrderByReference(reference: string) {
  return orderById.get(reference) ?? null;
}

export function __unsafeResetOrderStore() {
  orderById.clear();
}
