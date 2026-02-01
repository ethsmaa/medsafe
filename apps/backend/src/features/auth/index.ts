import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../database/prisma.js";

export const auth = betterAuth({
    baseURL: "http://localhost:3001",
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
    },
    // Stateless session management
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60, // 5 minutes cache
        },
    },
    account: {
        accountLinking: {
            enabled: true,
        },
    },
    trustedOrigins: [
        "http://localhost:3000",
        "http://localhost:3001",
    ],
});
