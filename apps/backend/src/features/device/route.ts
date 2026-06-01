import { Hono } from "hono";
import { fireAlarm, getStatus, stopAlarm, updateInfo } from "./esp32-client.js";

export const deviceRouter = new Hono();

deviceRouter.post("/alarm", async (c) => {
    const body = await c.req.json().catch(() => null);
    if (!body || typeof body.medication !== "string" || typeof body.nextDoseMinutes !== "number") {
        return c.json({ error: "medication (string) and nextDoseMinutes (number) required" }, 400);
    }
    try {
        const result = await fireAlarm({
            medication: body.medication,
            nextDoseMinutes: body.nextDoseMinutes,
        });
        return c.json({ ok: true, device: result });
    } catch (err) {
        return c.json({ error: (err as Error).message }, 502);
    }
});

deviceRouter.post("/info", async (c) => {
    const body = await c.req.json().catch(() => null);
    if (!body || typeof body.medication !== "string" || typeof body.nextDoseMinutes !== "number") {
        return c.json({ error: "medication (string) and nextDoseMinutes (number) required" }, 400);
    }
    try {
        const result = await updateInfo({
            medication: body.medication,
            nextDoseMinutes: body.nextDoseMinutes,
        });
        return c.json({ ok: true, device: result });
    } catch (err) {
        return c.json({ error: (err as Error).message }, 502);
    }
});

deviceRouter.post("/stop", async (c) => {
    try {
        const result = await stopAlarm();
        return c.json({ ok: true, device: result });
    } catch (err) {
        return c.json({ error: (err as Error).message }, 502);
    }
});

deviceRouter.get("/status", async (c) => {
    try {
        const result = await getStatus();
        return c.json(result);
    } catch (err) {
        return c.json({ error: (err as Error).message }, 502);
    }
});
