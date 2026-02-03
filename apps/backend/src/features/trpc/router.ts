import { router, publicProcedure } from "./index.js";
import { z } from "zod";

export const appRouter = router({
	hello: publicProcedure
		.input(z.object({ name: z.string().optional() }))
		.query(({ input,ctx }) => {
			return {
				greeting: `Hello ${input?.name ?? "World"} from MedSafe tRPC!`,
			};
		}),
});

export type AppRouter = typeof appRouter;