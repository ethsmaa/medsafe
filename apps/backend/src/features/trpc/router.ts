import { z } from "zod";
import { agentRouter } from "../agent/route.js";
import { careTeamRouter } from "../care-team/route.js";
import { medicationRouter } from "../medication/route.js";
import { userRouter } from "../user/route.js";
import { publicProcedure, router } from "./index.js";

export const appRouter = router({
	hello: publicProcedure
		.input(z.object({ name: z.string().optional() }))
		.query(({ input }) => {
			return {
				greeting: `Hello ${input?.name ?? "World"} from MedSafe tRPC!`,
			};
		}),
	agent: agentRouter,
	careTeam: careTeamRouter,
	medication: medicationRouter,
	user: userRouter,
});

export type AppRouter = typeof appRouter;
