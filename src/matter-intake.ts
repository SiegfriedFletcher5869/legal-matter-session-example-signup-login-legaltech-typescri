import { createServer } from "node:http";
import { z } from "zod";
import { InfraiError, infrai, idempotencyKey, request } from "./infrai-client.js";

export const intakeBody = z.object({ email: z.string().email(), password: z.string().min(8), name: z.string().min(1), widgetRecordId: z.string().min(1), captchaToken: z.string().min(1), matterTitle: z.string().min(1) });
export async function createMatterIntake(input: unknown) {
  const body = intakeBody.parse(input);
  const captcha = await infrai.captcha.verify(body.widgetRecordId, body.captchaToken, "signup");
  if (!captcha.verified) throw new InfraiError("CAPTCHA_REJECTED", 422, "Captcha verification was rejected");
  const user = await request<{ id: string }>("/v1/auth/user/create", "POST", { email: body.email, password: body.password, name: body.name, metadata: { matterTitle: body.matterTitle }, vendor: "infrai", mode: "email", idempotency_key: idempotencyKey() });
  const session = await request<{ session_id: string; refresh_token?: string }>("/v1/auth/session/create", "POST", { user_id: user.id, method: "password", require_mfa: false });
  return { userId: user.id, sessionId: session.session_id, matterTitle: body.matterTitle };
}

const server = createServer(async (req, res) => {
  if (req.method !== "POST" || req.url !== "/matters") { res.writeHead(404).end(); return; }
  try { const raw = await new Promise<string>((resolve) => { let s = ""; req.on("data", (c) => s += c); req.on("end", () => resolve(s)); }); const result = await createMatterIntake(JSON.parse(raw)); res.writeHead(201, { "content-type": "application/json" }).end(JSON.stringify(result)); }
  catch (error) { const status = error instanceof InfraiError ? (error.status >= 400 && error.status < 500 ? error.status : 502) : 400; res.writeHead(status, { "content-type": "application/json" }).end(JSON.stringify({ error: error instanceof Error ? error.message : "Invalid request" })); }
});
if (process.env.NODE_ENV !== "test") server.listen(Number(process.env.PORT ?? 3000));
