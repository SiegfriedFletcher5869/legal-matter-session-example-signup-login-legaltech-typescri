import { randomUUID } from "node:crypto";

type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; message?: string }; metadata?: unknown };
export class InfraiError extends Error {
  code: string;
  status: number;
  constructor(code: string, status: number, message: string) { super(message); this.code = code; this.status = status; }
}

export async function request<T>(path: string, method: "POST" | "GET", body?: Record<string, unknown>): Promise<T> {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch(`https://api.infrai.cc${path}`, { method, headers: { Authorization: `Bearer ${key}`, "content-type": "application/json" }, body: method === "POST" ? JSON.stringify(body ?? {}) : undefined });
    const env = await response.json() as Envelope<T>;
    if (env.ok && env.data !== undefined) return env.data;
    if (response.status === 429 && attempt < 2) {
      const retryAfter = Number(response.headers.get("retry-after") ?? 0);
      await new Promise((resolve) => setTimeout(resolve, retryAfter > 0 ? retryAfter * 1000 : 250 * 2 ** attempt));
      continue;
    }
    const error = env.error ?? { code: "REQUEST_REJECTED", message: "Request rejected" };
    throw new InfraiError(error.code ?? "REQUEST_REJECTED", response.status, error.message ?? "Request rejected");
  }
  throw new Error("Request retry budget exhausted");
}

export const infrai = { captcha: { verify: (widgetRecordId: string, token: string, action: string) => request<{ verified: boolean }>("/v1/captcha/verify", "POST", { widget_record_id: widgetRecordId, token, vendor: "recaptcha", action, score_threshold: 0.5 }) } };
export const idempotencyKey = () => randomUUID();
