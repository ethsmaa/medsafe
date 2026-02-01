import { initTRPC } from "@trpc/server";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { Context } from "hono";
import superjson from "superjson";
import { ZodError } from "zod";
import { auth } from "../auth/index.js";

export const createTRPCConextForHono = async (
	opts: FetchCreateContextFnOptions,
	c: Context,
) => {
	const session = await auth.api.getSession({
		headers: opts.req.headers,
	});

	return {
		c,
		user: session?.user || null,
		session: session?.session || null,
	};
};

type TRPCHonoContext = Awaited<ReturnType<typeof createTRPCConextForHono>>;

const t = initTRPC.context<TRPCHonoContext>().create({
	transformer: superjson,
	errorFormatter(opts) {
		const { shape, error } = opts;
		return {
			...shape,
			data: {
				...shape.data,
				zodError:
					error.code === "BAD_REQUEST" && error.cause instanceof ZodError
						? error.cause.flatten()
						: null,
			},
		};
	},
});


export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = publicProcedure.use(async ({ ctx, next }) => {
    // Placeholder for auth check
	if (!ctx.user) {
        // Uncomment to enforce auth
		// throw new TRPCError({
		// 	code: "UNAUTHORIZED",
		// 	message: "You must be logged in to access this resource",
		// });
	}
	return next({
		ctx: {
			...ctx,
			user: ctx.user,
		},
	});
});
