import { randomBytes } from "node:crypto";

/**
 * Alphabet for shareable connect codes. Visually ambiguous characters
 * (0/O, 1/I/L) are removed so the code is easy to read aloud and type.
 */
export const CONNECT_CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const CONNECT_CODE_LENGTH = 8;

/**
 * Maps a byte buffer to a fixed-length code over CONNECT_CODE_ALPHABET.
 * Pure and deterministic so it can be unit-tested.
 */
export function codeFromBytes(bytes: Uint8Array): string {
	let out = "";
	for (let i = 0; i < CONNECT_CODE_LENGTH; i++) {
		const byte = bytes[i] ?? 0;
		out += CONNECT_CODE_ALPHABET[byte % CONNECT_CODE_ALPHABET.length];
	}
	return out;
}

/** Generates a random connect code (not guaranteed unique — caller checks). */
export function generateConnectCode(): string {
	return codeFromBytes(randomBytes(CONNECT_CODE_LENGTH));
}

/** Normalizes user-entered codes (trim, uppercase) for lookup. */
export function normalizeConnectCode(raw: string): string {
	return raw.trim().toUpperCase();
}
