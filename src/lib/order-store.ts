import type { OrderData } from "@/lib/types";

const orderById = new Map<string, OrderData>();

const ORDER_KEY_PREFIX = "finishpoint:order:";
const DEFAULT_ORDER_TTL_SECONDS = 60 * 60 * 24 * 30;

type KvConfig = {
  url: string;
  token: string;
  ttlSeconds: number;
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

export function __unsafeResetOrderStore() {
  orderById.clear();
}
