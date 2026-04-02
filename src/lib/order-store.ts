import type { OrderData } from "@/lib/types";
import { getSupabaseAdminClient } from "./supabase-admin";

const orderById = new Map<string, OrderData>();

const ORDER_KEY_PREFIX = "finishpoint:order:";
const DEFAULT_ORDER_TTL_SECONDS = 60 * 60 * 24 * 30;

type KvConfig = {
  url: string;
  token: string;
  ttlSeconds: number;
};

type OrderRow = {
  order_id: string;
  order_date: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string | null;
  service_description: string;
  pickup_address: string;
  delivery_address: string;
  total_with_vat: number | string;
  vat_rate: number | string;
  vat_amount: number | string;
  net_amount: number | string;
  payment_method: OrderData["paymentMethod"];
  payment_status: string;
  vipps_reference: string | null;
};

function getKvConfig(): KvConfig | null {
  const url = process.env.KV_REST_API_URL?.trim() ?? "";
  const token = process.env.KV_REST_API_TOKEN?.trim() ?? "";

  if (!url || !token) {
    return null;
  }

  const rawTtl = Number(process.env.ORDER_STORE_TTL_SECONDS ?? DEFAULT_ORDER_TTL_SECONDS);
  const ttlSeconds = Number.isFinite(rawTtl) && rawTtl > 0
    ? Math.floor(rawTtl)
    : DEFAULT_ORDER_TTL_SECONDS;

  return { url, token, ttlSeconds };
}

function toOrderKey(orderId: string) {
  return `${ORDER_KEY_PREFIX}${orderId}`;
}

function toOrderRow(order: OrderData): OrderRow {
  return {
    order_id: order.orderId,
    order_date: order.orderDate,
    customer_name: order.customerName,
    customer_email: order.customerEmail,
    customer_phone: order.customerPhone,
    customer_address: order.customerAddress ?? null,
    service_description: order.serviceDescription,
    pickup_address: order.pickupAddress,
    delivery_address: order.deliveryAddress,
    total_with_vat: order.totalWithVat,
    vat_rate: order.vatRate,
    vat_amount: order.vatAmount,
    net_amount: order.netAmount,
    payment_method: order.paymentMethod,
    payment_status: order.paymentMethod === "invoice" ? "invoice_pending" : "payment_pending",
    vipps_reference: order.vippsReference ?? null,
  };
}

function asNumber(value: number | string) {
  return typeof value === "number" ? value : Number(value);
}

function fromOrderRow(row: OrderRow): OrderData {
  return {
    orderId: row.order_id,
    orderDate: row.order_date,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    customerAddress: row.customer_address ?? undefined,
    serviceDescription: row.service_description,
    pickupAddress: row.pickup_address,
    deliveryAddress: row.delivery_address,
    totalWithVat: asNumber(row.total_with_vat),
    vatRate: asNumber(row.vat_rate),
    vatAmount: asNumber(row.vat_amount),
    netAmount: asNumber(row.net_amount),
    paymentMethod: row.payment_method,
    vippsReference: row.vipps_reference ?? undefined,
  };
}

async function saveOrderToSupabase(order: OrderData) {
  const client = getSupabaseAdminClient();
  if (!client) {
    return false;
  }

  const { error } = await client.from("orders").upsert(toOrderRow(order), {
    onConflict: "order_id",
  });

  if (error) {
    throw new Error(`Supabase saveOrder failed: ${error.message}`);
  }

  return true;
}

async function getOrderByReferenceFromSupabase(reference: string) {
  const client = getSupabaseAdminClient();
  if (!client) {
    return null;
  }

  const byOrderId = await client
    .from("orders")
    .select("order_id, order_date, customer_name, customer_email, customer_phone, customer_address, service_description, pickup_address, delivery_address, total_with_vat, vat_rate, vat_amount, net_amount, payment_method, payment_status, vipps_reference")
    .eq("order_id", reference)
    .maybeSingle<OrderRow>();

  if (byOrderId.error) {
    throw new Error(`Supabase getOrderByReference failed: ${byOrderId.error.message}`);
  }

  if (byOrderId.data) {
    return fromOrderRow(byOrderId.data);
  }

  const byVippsReference = await client
    .from("orders")
    .select("order_id, order_date, customer_name, customer_email, customer_phone, customer_address, service_description, pickup_address, delivery_address, total_with_vat, vat_rate, vat_amount, net_amount, payment_method, payment_status, vipps_reference")
    .eq("vipps_reference", reference)
    .maybeSingle<OrderRow>();

  if (byVippsReference.error) {
    throw new Error(`Supabase getOrderByReference failed: ${byVippsReference.error.message}`);
  }

  return byVippsReference.data ? fromOrderRow(byVippsReference.data) : null;
}

async function markOrderAsPaidInSupabase(orderId: string, vippsReference: string) {
  const client = getSupabaseAdminClient();
  if (!client) {
    return false;
  }

  const { error } = await client
    .from("orders")
    .update({
      payment_status: "paid",
      paid_at: new Date().toISOString(),
      vipps_reference: vippsReference || null,
    })
    .eq("order_id", orderId);

  if (error) {
    throw new Error(`Supabase markOrderAsPaid failed: ${error.message}`);
  }

  return true;
}

async function executeKvCommand(config: KvConfig, command: unknown[]) {
  const response = await fetch(config.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`KV command failed with status ${response.status}`);
  }

  return response.json() as Promise<{ result?: unknown }>;
}

export async function saveOrder(order: OrderData) {
  try {
    const savedToSupabase = await saveOrderToSupabase(order);
    if (savedToSupabase) {
      return;
    }
  } catch (error) {
    console.error("Supabase saveOrder failed, falling back to KV or in-memory store", {
      orderId: order.orderId,
      error,
    });
  }

  const kv = getKvConfig();
  if (kv) {
    try {
      const key = toOrderKey(order.orderId);
      await executeKvCommand(kv, [
        "SET",
        key,
        JSON.stringify(order),
        "EX",
        `${kv.ttlSeconds}`,
      ]);
      return;
    } catch (error) {
      console.error("KV saveOrder failed, falling back to in-memory store", {
        orderId: order.orderId,
        error,
      });
    }
  }

  orderById.set(order.orderId, order);
}

export async function getOrderByReference(reference: string) {
  try {
    const order = await getOrderByReferenceFromSupabase(reference);
    if (order) {
      return order;
    }
  } catch (error) {
    console.error("Supabase getOrderByReference failed, falling back to KV or in-memory store", {
      reference,
      error,
    });
  }

  const kv = getKvConfig();
  if (kv) {
    try {
      const key = toOrderKey(reference);
      const payload = await executeKvCommand(kv, ["GET", key]);
      if (typeof payload.result === "string" && payload.result) {
        return JSON.parse(payload.result) as OrderData;
      }
      return null;
    } catch (error) {
      console.error("KV getOrderByReference failed, falling back to in-memory store", {
        reference,
        error,
      });
    }
  }

  return orderById.get(reference) ?? null;
}

export async function markOrderAsPaid(orderId: string, vippsReference: string) {
  try {
    const updatedInSupabase = await markOrderAsPaidInSupabase(orderId, vippsReference);
    if (updatedInSupabase) {
      return;
    }
  } catch (error) {
    console.error("Supabase markOrderAsPaid failed, falling back to KV or in-memory store", {
      orderId,
      vippsReference,
      error,
    });
  }

  const kv = getKvConfig();
  if (kv) {
    try {
      const key = toOrderKey(orderId);
      const payload = await executeKvCommand(kv, ["GET", key]);

      if (typeof payload.result === "string" && payload.result) {
        const order = JSON.parse(payload.result) as OrderData;
        order.vippsReference = vippsReference;

        await executeKvCommand(kv, [
          "SET",
          key,
          JSON.stringify(order),
          "EX",
          `${kv.ttlSeconds}`,
        ]);
        return;
      }
    } catch (error) {
      console.error("KV markOrderAsPaid failed, falling back to in-memory store", {
        orderId,
        vippsReference,
        error,
      });
    }
  }

  const inMemoryOrder = orderById.get(orderId);
  if (inMemoryOrder) {
    orderById.set(orderId, {
      ...inMemoryOrder,
      vippsReference,
    });
  }
}

export function __unsafeResetOrderStore() {
  orderById.clear();
}
