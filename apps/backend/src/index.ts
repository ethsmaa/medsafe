import { serve } from "@hono/node-server";
import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./features/auth/index.js";
import { deviceRouter } from "./features/device/route.js";
import { createTRPCConextForHono } from "./features/trpc/index.js";
import { appRouter } from "./features/trpc/router.js";

export type { AppRouter } from "./features/trpc/router.js";

const app = new Hono();

// Global CORS Middleware
app.use(
	"*",
	cors({
		origin: (origin) => {
			// In development, allow all origins (mobile IP changes frequently)
			if (process.env.NODE_ENV !== "production") return origin;
			// In production, whitelist specific origins
			const allowed = ["https://medsafe.app", "https://api.medsafe.app"];
			return allowed.includes(origin) ? origin : null;
		},
		allowHeaders: ["Content-Type", "Authorization"],
		allowMethods: ["POST", "GET", "OPTIONS"],
		exposeHeaders: ["Content-Length"],
		maxAge: 600,
		credentials: true,
	}),
);

app.get("/", (c) => {
	return c.text("Hello World from MedSafe Backend!");
});

app.all("/api/auth/*", (c) => {
	return auth.handler(c.req.raw);
});

app.route("/api/device", deviceRouter);

app.use(
	"/trpc/*",
	trpcServer({
		router: appRouter,
		createContext: createTRPCConextForHono,
	}),
);

const port = 3001;
// biome-ignore lint/suspicious/noConsole: server startup message
console.info(`Server is running on port ${port}`);

serve({
	fetch: app.fetch,
	port,
	hostname: "0.0.0.0",
});
