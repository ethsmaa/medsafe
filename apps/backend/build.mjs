/** biome-ignore-all lint/suspicious/noConsole: This is a build script. */
import { exec } from "node:child_process";
import { resolve } from "node:path";
import { promisify } from "node:util";
import { build, context } from "esbuild";

const execAsync = promisify(exec);
const isWatching = !!process.argv.includes("--watch");

const buildOptions = {
	entryPoints: ["src/index.ts"],
	outfile: resolve(process.cwd(), "dist", "runtime", "server.js"),
	platform: "node",
	bundle: true,
	target: "node20",
	format: "esm",
	logLevel: "info",
	sourcemap: true,
	external: ["pg", "@prisma/client"],
};

async function generateTypes() {
	console.log("Generating TypeScript declarations...");
	try {
		await execAsync("tsc --declaration --emitDeclarationOnly --declarationMap");
		console.log("TypeScript declarations generated successfully");
	} catch (error) {
		console.error("Failed to generate TypeScript declarations:", error.message);
	}
}

if (isWatching) {
	context(buildOptions).then(async (ctx) => {
		await ctx.watch();
		await generateTypes();
		console.log("Watching for changes...");
	});
} else {
	build(buildOptions).then(async () => {
		await generateTypes();
	});
}
