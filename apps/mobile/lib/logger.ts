/**
 * biome-ignore-all lint/suspicious/noConsole: this module is the single sanctioned
 * console boundary. swap the implementation here (e.g. sentry) without touching call sites.
 */

type LogArgs = readonly unknown[];

export const logger = {
	info: (...args: LogArgs) => console.info(...args),
	warn: (...args: LogArgs) => console.warn(...args),
	error: (...args: LogArgs) => console.error(...args),
};
