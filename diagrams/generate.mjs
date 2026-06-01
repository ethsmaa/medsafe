/** biome-ignore-all lint/suspicious/noConsole: diagram generation cli script */
/** biome-ignore-all lint/correctness/noUnusedFunctionParameters: style helpers keep a stable param signature */
// Generates Excalidraw diagrams for the MedSafe academic poster (DEÜ GBYF).
// Palette matches poster: cream bg, burgundy/charcoal accents, soft pink.
// Run:  node diagrams/generate.mjs
// Import outputs into excalidraw.com via menu → Open. Export as PNG/SVG.

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

let seedCounter = 1;
const nextSeed = () => seedCounter++ * 1000003 + 7;
const rid = () => Math.random().toString(36).slice(2, 12);

// Clean academic look: Helvetica, low roughness, thin strokes
const FONT = 2; // 1=Virgil hand-drawn, 2=Helvetica, 3=Cascadia mono
const ROUGH = 0;

const baseStyle = {
	angle: 0,
	strokeColor: "#1c1c1c",
	backgroundColor: "transparent",
	fillStyle: "solid",
	strokeWidth: 1.5,
	strokeStyle: "solid",
	roughness: ROUGH,
	opacity: 100,
	groupIds: [],
	frameId: null,
	roundness: { type: 3 },
	isDeleted: false,
	boundElements: [],
	updatedAt: Date.now(),
	link: null,
	locked: false,
};

function rect({
	x,
	y,
	w,
	h,
	fill = "#ffffff",
	stroke = "#1c1c1c",
	strokeW = 1.5,
}) {
	return {
		...baseStyle,
		id: rid(),
		type: "rectangle",
		x,
		y,
		width: w,
		height: h,
		strokeColor: stroke,
		backgroundColor: fill,
		strokeWidth: strokeW,
		seed: nextSeed(),
		version: 1,
		versionNonce: nextSeed(),
	};
}

function diamond({ x, y, w, h, fill = "#ffffff", stroke = "#1c1c1c" }) {
	return {
		...baseStyle,
		id: rid(),
		type: "diamond",
		x,
		y,
		width: w,
		height: h,
		strokeColor: stroke,
		backgroundColor: fill,
		seed: nextSeed(),
		version: 1,
		versionNonce: nextSeed(),
	};
}

function text({
	x,
	y,
	w,
	h,
	content,
	size = 16,
	color = "#1c1c1c",
	containerId = null,
	align = "center",
	weight = "regular",
}) {
	return {
		...baseStyle,
		id: rid(),
		type: "text",
		x,
		y,
		width: w,
		height: h,
		strokeColor: color,
		backgroundColor: "transparent",
		seed: nextSeed(),
		version: 1,
		versionNonce: nextSeed(),
		text: content,
		fontSize: size,
		fontFamily: FONT,
		textAlign: align,
		verticalAlign: "middle",
		baseline: Math.round(size * 0.85),
		containerId,
		originalText: content,
		lineHeight: 1.25,
		autoResize: true,
	};
}

function box({
	x,
	y,
	w,
	h,
	label,
	fill = "#ffffff",
	stroke = "#1c1c1c",
	textColor = "#1c1c1c",
	size = 14,
	strokeW = 1.5,
}) {
	const r = rect({ x, y, w, h, fill, stroke, strokeW });
	const lines = label.split("\n").length;
	const blockH = size * lines * 1.25;
	const t = text({
		x: x + 8,
		y: y + h / 2 - blockH / 2,
		w: w - 16,
		h: blockH,
		content: label,
		size,
		color: textColor,
		containerId: r.id,
	});
	r.boundElements = [{ id: t.id, type: "text" }];
	return [r, t];
}

function arrow({
	x1,
	y1,
	x2,
	y2,
	label,
	stroke = "#5a3d3d",
	strokeW = 1.5,
	dashed = false,
}) {
	const minX = Math.min(x1, x2);
	const minY = Math.min(y1, y2);
	const points = [
		[x1 - minX, y1 - minY],
		[x2 - minX, y2 - minY],
	];
	const a = {
		...baseStyle,
		id: rid(),
		type: "arrow",
		x: minX,
		y: minY,
		width: Math.abs(x2 - x1),
		height: Math.abs(y2 - y1),
		strokeColor: stroke,
		backgroundColor: "transparent",
		strokeWidth: strokeW,
		strokeStyle: dashed ? "dashed" : "solid",
		seed: nextSeed(),
		version: 1,
		versionNonce: nextSeed(),
		points,
		lastCommittedPoint: null,
		startBinding: null,
		endBinding: null,
		startArrowhead: null,
		endArrowhead: "arrow",
		roundness: { type: 2 },
		elbowed: false,
	};
	const out = [a];
	if (label) {
		const midX = (x1 + x2) / 2;
		const midY = (y1 + y2) / 2;
		out.push(
			text({
				x: midX - 70,
				y: midY - 18,
				w: 140,
				h: 22,
				content: label,
				size: 12,
				color: "#5a3d3d",
			}),
		);
	}
	return out;
}

function title(t, x, y) {
	return text({
		x,
		y,
		w: 800,
		h: 40,
		content: t,
		size: 26,
		align: "left",
		color: "#1c1c1c",
	});
}

function subtitle(t, x, y) {
	return text({
		x,
		y,
		w: 900,
		h: 22,
		content: t,
		size: 13,
		align: "left",
		color: "#7a5a5a",
	});
}

function sectionLabel(t, x, y, w = 200) {
	return text({
		x,
		y,
		w,
		h: 18,
		content: t,
		size: 11,
		align: "left",
		color: "#8B3A47",
	});
}

function buildFile(elements) {
	return {
		type: "excalidraw",
		version: 2,
		source: "medsafe-poster",
		elements,
		appState: { gridSize: null, viewBackgroundColor: "#FBF7F1" },
		files: {},
	};
}

// Poster palette
const C = {
	cream: "#FBF7F1", // bg
	card: "#FFFFFF", // card
	burgundy: "#8B3A47", // primary accent (AI)
	burgundyDark: "#6E2A36", // hover/dark
	rose: "#D4A0A8", // soft pink
	roseLight: "#F0DCDF", // pale pink
	charcoal: "#2A2A2A", // dark (data)
	warm: "#E8DCC4", // warm beige (api)
	warmDark: "#C9B891", // warm beige stroke
	ink: "#1c1c1c",
	inkSoft: "#5a3d3d",
};

// =================================================================
// 1. SYSTEM ARCHITECTURE
// =================================================================
function architecture() {
	const els = [];
	els.push(title("Sistem Mimarisi", 40, 30));
	els.push(
		subtitle("MedSafe — yapay zekâ destekli, sesli ilaç takip sistemi", 40, 64),
	);

	// Actor row
	els.push(sectionLabel("KULLANICILAR", 60, 110));
	els.push(
		...box({
			x: 60,
			y: 130,
			w: 200,
			h: 70,
			label: "Yaşlı Hasta",
			fill: C.roseLight,
			stroke: C.burgundy,
			size: 15,
		}),
	);
	els.push(
		...box({
			x: 320,
			y: 130,
			w: 200,
			h: 70,
			label: "Bakıcı / Aile",
			fill: C.roseLight,
			stroke: C.burgundy,
			size: 15,
		}),
	);

	// Mobile layer
	els.push(sectionLabel("İSTEMCİ", 60, 240));
	els.push(
		...box({
			x: 60,
			y: 260,
			w: 460,
			h: 220,
			label: "",
			fill: C.card,
			stroke: C.warmDark,
		}),
	);
	els.push(
		text({
			x: 80,
			y: 275,
			w: 420,
			h: 22,
			content: "Mobil Uygulama  ·  Expo · React Native · NativeWind",
			size: 14,
			align: "left",
			color: C.ink,
		}),
	);
	els.push(
		...box({
			x: 80,
			y: 310,
			w: 135,
			h: 60,
			label: "Hasta Arayüzü\nilaç takibi",
			fill: C.warm,
			stroke: C.warmDark,
			size: 12,
		}),
	);
	els.push(
		...box({
			x: 225,
			y: 310,
			w: 135,
			h: 60,
			label: "Bakıcı Paneli\nuyum, uyarı",
			fill: C.warm,
			stroke: C.warmDark,
			size: 12,
		}),
	);
	els.push(
		...box({
			x: 370,
			y: 310,
			w: 135,
			h: 60,
			label: "Sesli Asistan\nchat + ses",
			fill: C.warm,
			stroke: C.warmDark,
			size: 12,
		}),
	);
	els.push(
		...box({
			x: 80,
			y: 385,
			w: 425,
			h: 70,
			label:
				"expo-secure-store · expo-notifications · i18n (TR / EN)\nSQLite önbellek (offline-first)",
			fill: C.cream,
			stroke: C.warmDark,
			size: 11,
		}),
	);

	// tRPC
	els.push(
		...arrow({
			x1: 290,
			y1: 480,
			x2: 290,
			y2: 555,
			label: "tRPC / HTTPS",
			stroke: C.burgundy,
			strokeW: 2,
		}),
	);

	// Backend layer
	els.push(sectionLabel("SUNUCU", 60, 535));
	els.push(
		...box({
			x: 60,
			y: 555,
			w: 460,
			h: 240,
			label: "",
			fill: C.card,
			stroke: C.warmDark,
		}),
	);
	els.push(
		text({
			x: 80,
			y: 570,
			w: 420,
			h: 22,
			content: "API Sunucusu  ·  Hono · tRPC · Prisma · Node.js",
			size: 14,
			align: "left",
			color: C.ink,
		}),
	);
	els.push(
		...box({
			x: 80,
			y: 605,
			w: 135,
			h: 60,
			label: "Auth Router\nbetter-auth",
			fill: C.warm,
			stroke: C.warmDark,
			size: 12,
		}),
	);
	els.push(
		...box({
			x: 225,
			y: 605,
			w: 135,
			h: 60,
			label: "İlaç Router\ntakip · doz",
			fill: C.warm,
			stroke: C.warmDark,
			size: 12,
		}),
	);
	els.push(
		...box({
			x: 370,
			y: 605,
			w: 135,
			h: 60,
			label: "Bakım Ekibi\nRouter",
			fill: C.warm,
			stroke: C.warmDark,
			size: 12,
		}),
	);
	els.push(
		...box({
			x: 80,
			y: 680,
			w: 200,
			h: 60,
			label: "Agent Router\nchat + voice",
			fill: C.burgundy,
			stroke: C.burgundyDark,
			textColor: "#ffffff",
			size: 12,
		}),
	);
	els.push(
		...box({
			x: 290,
			y: 680,
			w: 215,
			h: 60,
			label: "Tool Handlers\ntarama · not · hatırlatıcı",
			fill: C.burgundy,
			stroke: C.burgundyDark,
			textColor: "#ffffff",
			size: 12,
		}),
	);

	// Right column AI services
	els.push(sectionLabel("YAPAY ZEKÂ", 600, 240));
	els.push(
		...box({
			x: 600,
			y: 260,
			w: 280,
			h: 100,
			label: "Gemini 2.5 Flash\nLLM · Tool-use · ReAct",
			fill: C.burgundy,
			stroke: C.burgundyDark,
			textColor: "#ffffff",
			size: 14,
		}),
	);
	els.push(
		...box({
			x: 600,
			y: 380,
			w: 280,
			h: 100,
			label: "Speech-to-Text\nGemini ses transkripsiyon",
			fill: C.burgundy,
			stroke: C.burgundyDark,
			textColor: "#ffffff",
			size: 14,
		}),
	);
	els.push(
		...box({
			x: 600,
			y: 500,
			w: 280,
			h: 100,
			label: "Vision OCR\nilaç kutusu tarama",
			fill: C.burgundy,
			stroke: C.burgundyDark,
			textColor: "#ffffff",
			size: 14,
		}),
	);

	// Right column infra
	els.push(sectionLabel("VERİ", 600, 620));
	els.push(
		...box({
			x: 600,
			y: 640,
			w: 280,
			h: 80,
			label: "PostgreSQL\nPrisma ORM",
			fill: C.charcoal,
			stroke: C.charcoal,
			textColor: "#ffffff",
			size: 14,
		}),
	);
	els.push(
		...box({
			x: 600,
			y: 740,
			w: 280,
			h: 60,
			label: "Docker · Coolify · Hetzner",
			fill: C.cream,
			stroke: C.charcoal,
			size: 12,
		}),
	);

	// Service connections
	els.push(
		...arrow({
			x1: 520,
			y1: 710,
			x2: 600,
			y2: 685,
			label: "Prisma",
			stroke: C.inkSoft,
		}),
	);
	els.push(
		...arrow({
			x1: 520,
			y1: 710,
			x2: 600,
			y2: 550,
			label: "vision",
			stroke: C.inkSoft,
		}),
	);
	els.push(
		...arrow({
			x1: 520,
			y1: 710,
			x2: 600,
			y2: 430,
			label: "audio",
			stroke: C.inkSoft,
		}),
	);
	els.push(
		...arrow({
			x1: 520,
			y1: 710,
			x2: 600,
			y2: 310,
			label: "chat",
			stroke: C.inkSoft,
		}),
	);

	// Notifications
	els.push(
		...box({
			x: 600,
			y: 130,
			w: 280,
			h: 70,
			label: "Push Bildirimi\nFCM / APNS",
			fill: C.rose,
			stroke: C.burgundy,
			size: 14,
		}),
	);
	els.push(
		...arrow({
			x1: 600,
			y1: 165,
			x2: 520,
			y2: 165,
			label: "schedule",
			stroke: C.burgundy,
		}),
	);
	els.push(
		...arrow({
			x1: 320,
			y1: 200,
			x2: 740,
			y2: 200,
			label: "reminder",
			stroke: C.burgundy,
			dashed: true,
		}),
	);

	// User → mobile
	els.push(
		...arrow({ x1: 160, y1: 200, x2: 160, y2: 260, stroke: C.burgundy }),
	);
	els.push(
		...arrow({ x1: 420, y1: 200, x2: 420, y2: 260, stroke: C.burgundy }),
	);

	return buildFile(els);
}

// =================================================================
// 2. VOICE ASSISTANT FLOW
// =================================================================
function voiceFlow() {
	const els = [];
	els.push(title("Sesli Asistan Akışı", 40, 30));
	els.push(
		subtitle(
			"STT → Gemini agent (tool-use) → Postgres → TTS · ellersiz ilaç sorguları",
			40,
			64,
		),
	);

	// Lanes
	els.push(sectionLabel("HASTA", 40, 120));
	els.push(sectionLabel("MOBİL İSTEMCİ", 40, 260));
	els.push(sectionLabel("SUNUCU & YAPAY ZEKÂ", 40, 460));

	// Lane backgrounds (very subtle)
	els.push(
		rect({
			x: 30,
			y: 110,
			w: 1100,
			h: 130,
			fill: C.cream,
			stroke: C.warmDark,
			strokeW: 1,
		}),
	);
	els.push(
		rect({
			x: 30,
			y: 250,
			w: 1100,
			h: 200,
			fill: "#FFFFFF",
			stroke: C.warmDark,
			strokeW: 1,
		}),
	);
	els.push(
		rect({
			x: 30,
			y: 460,
			w: 1100,
			h: 280,
			fill: C.cream,
			stroke: C.warmDark,
			strokeW: 1,
		}),
	);

	// Re-add labels on top
	els.push(sectionLabel("HASTA", 40, 120));
	els.push(sectionLabel("MOBİL İSTEMCİ", 40, 260));
	els.push(sectionLabel("SUNUCU & YAPAY ZEKÂ", 40, 470));

	// Step 1: speak
	els.push(
		...box({
			x: 220,
			y: 145,
			w: 180,
			h: 70,
			label: "Mikrofona basıp\nkonuşur",
			fill: C.roseLight,
			stroke: C.burgundy,
			size: 13,
		}),
	);
	els.push(
		...arrow({ x1: 310, y1: 215, x2: 310, y2: 290, stroke: C.burgundy }),
	);

	// Step 2: record
	els.push(
		...box({
			x: 220,
			y: 290,
			w: 180,
			h: 70,
			label: "useVoiceRecorder\n(expo-av)",
			fill: C.warm,
			stroke: C.warmDark,
			size: 13,
		}),
	);
	els.push(...arrow({ x1: 400, y1: 325, x2: 480, y2: 325, stroke: C.inkSoft }));

	// Step 3: STT client
	els.push(
		...box({
			x: 480,
			y: 290,
			w: 200,
			h: 70,
			label: "useSpeechToText\nses dosyası gönder",
			fill: C.warm,
			stroke: C.warmDark,
			size: 13,
		}),
	);
	els.push(
		...arrow({
			x1: 580,
			y1: 360,
			x2: 580,
			y2: 510,
			label: "audio blob",
			stroke: C.burgundy,
		}),
	);

	// Step 4: STT backend
	els.push(
		...box({
			x: 480,
			y: 510,
			w: 200,
			h: 80,
			label: "transcribe-service\nGemini ses API",
			fill: C.burgundy,
			stroke: C.burgundyDark,
			textColor: "#ffffff",
			size: 13,
		}),
	);
	els.push(
		...arrow({
			x1: 580,
			y1: 590,
			x2: 580,
			y2: 645,
			label: "transcript",
			stroke: C.inkSoft,
		}),
	);

	// Step 5: agent
	els.push(
		...box({
			x: 480,
			y: 645,
			w: 200,
			h: 80,
			label: "agent-service\nGemini + tools",
			fill: C.burgundy,
			stroke: C.burgundyDark,
			textColor: "#ffffff",
			size: 13,
		}),
	);

	// Tool branch
	els.push(
		...box({
			x: 720,
			y: 645,
			w: 200,
			h: 80,
			label: "tool-handlers\nilaç · doz · not",
			fill: C.warm,
			stroke: C.warmDark,
			size: 13,
		}),
	);
	els.push(
		...arrow({
			x1: 680,
			y1: 685,
			x2: 720,
			y2: 685,
			label: "tool call",
			stroke: C.inkSoft,
		}),
	);
	els.push(
		...box({
			x: 720,
			y: 510,
			w: 200,
			h: 80,
			label: "PostgreSQL\nilaçlar · alımlar",
			fill: C.charcoal,
			stroke: C.charcoal,
			textColor: "#ffffff",
			size: 13,
		}),
	);
	els.push(
		...arrow({
			x1: 820,
			y1: 645,
			x2: 820,
			y2: 590,
			label: "DB query",
			stroke: C.inkSoft,
		}),
	);
	els.push(
		...arrow({
			x1: 720,
			y1: 550,
			x2: 680,
			y2: 685,
			label: "result",
			stroke: C.inkSoft,
			dashed: true,
		}),
	);

	// Back to client
	els.push(
		...arrow({
			x1: 480,
			y1: 685,
			x2: 220,
			y2: 685,
			label: "yanıt metni",
			stroke: C.burgundy,
		}),
	);
	els.push(
		...box({
			x: 40,
			y: 645,
			w: 180,
			h: 80,
			label: "useTextToSpeech\n(expo-speech)",
			fill: C.warm,
			stroke: C.warmDark,
			size: 13,
		}),
	);

	// Up to user
	els.push(
		...arrow({
			x1: 130,
			y1: 645,
			x2: 130,
			y2: 215,
			label: "sesli yanıt",
			stroke: C.burgundy,
			dashed: true,
		}),
	);
	els.push(
		...arrow({ x1: 130, y1: 215, x2: 220, y2: 180, stroke: C.burgundy }),
	);

	// Chat bubble
	els.push(
		...box({
			x: 220,
			y: 365,
			w: 180,
			h: 70,
			label: "Sohbet ekranı\nmesaj kabarcığı",
			fill: C.warm,
			stroke: C.warmDark,
			size: 13,
		}),
	);
	els.push(
		...arrow({
			x1: 310,
			y1: 435,
			x2: 310,
			y2: 510,
			dashed: true,
			stroke: C.inkSoft,
		}),
	);
	els.push(
		...arrow({
			x1: 480,
			y1: 725,
			x2: 310,
			y2: 435,
			dashed: true,
			label: "stream",
			stroke: C.inkSoft,
		}),
	);

	return buildFile(els);
}

// =================================================================
// 3. MEDICATION TRACKING FLOW
// =================================================================
function medicationFlow() {
	const els = [];
	els.push(title("İlaç Takip Akışı", 40, 30));
	els.push(
		subtitle(
			"Tarama ile kayıt → hatırlatma → alım kaydı → bakıcı görünürlüğü",
			40,
			64,
		),
	);

	// Phase 1
	els.push(sectionLabel("01  İLAÇ EKLEME", 40, 110));
	els.push(
		...box({
			x: 40,
			y: 135,
			w: 170,
			h: 80,
			label: "Kamera aç /\nkutu fotoğrafı",
			fill: C.roseLight,
			stroke: C.burgundy,
			size: 13,
		}),
	);
	els.push(...arrow({ x1: 210, y1: 175, x2: 250, y2: 175, stroke: C.inkSoft }));
	els.push(
		...box({
			x: 250,
			y: 135,
			w: 170,
			h: 80,
			label: "scan-medication\nGemini Vision",
			fill: C.burgundy,
			stroke: C.burgundyDark,
			textColor: "#ffffff",
			size: 13,
		}),
	);
	els.push(...arrow({ x1: 420, y1: 175, x2: 460, y2: 175, stroke: C.inkSoft }));
	els.push(
		...box({
			x: 460,
			y: 135,
			w: 200,
			h: 80,
			label: "Çıkar: ilaç adı,\ndoz, sıklık",
			fill: C.warm,
			stroke: C.warmDark,
			size: 13,
		}),
	);
	els.push(...arrow({ x1: 660, y1: 175, x2: 700, y2: 175, stroke: C.inkSoft }));
	els.push(
		...box({
			x: 700,
			y: 135,
			w: 180,
			h: 80,
			label: "Hasta onaylar\n& kaydeder",
			fill: C.roseLight,
			stroke: C.burgundy,
			size: 13,
		}),
	);
	els.push(
		...arrow({
			x1: 790,
			y1: 215,
			x2: 790,
			y2: 285,
			label: "kalıcı kayıt",
			stroke: C.burgundy,
		}),
	);
	els.push(
		...box({
			x: 700,
			y: 285,
			w: 180,
			h: 70,
			label: "PostgreSQL\nmedication",
			fill: C.charcoal,
			stroke: C.charcoal,
			textColor: "#ffffff",
			size: 13,
		}),
	);

	// Phase 2
	els.push(sectionLabel("02  HATIRLATICI VE ALIM", 40, 410));
	els.push(
		...box({
			x: 40,
			y: 435,
			w: 180,
			h: 80,
			label: "Zaman çizelgesi\n(her ilaca özel)",
			fill: C.warm,
			stroke: C.warmDark,
			size: 13,
		}),
	);
	els.push(...arrow({ x1: 220, y1: 475, x2: 260, y2: 475, stroke: C.inkSoft }));
	els.push(
		...box({
			x: 260,
			y: 435,
			w: 180,
			h: 80,
			label: "expo-notifications\nlocal + push",
			fill: C.rose,
			stroke: C.burgundy,
			size: 13,
		}),
	);
	els.push(...arrow({ x1: 440, y1: 475, x2: 480, y2: 475, stroke: C.inkSoft }));
	els.push(
		...box({
			x: 480,
			y: 435,
			w: 180,
			h: 80,
			label: "Hasta hatırlatma\nalır",
			fill: C.roseLight,
			stroke: C.burgundy,
			size: 13,
		}),
	);
	els.push(...arrow({ x1: 660, y1: 475, x2: 700, y2: 475, stroke: C.inkSoft }));
	els.push(
		diamond({
			x: 700,
			y: 430,
			w: 180,
			h: 90,
			fill: C.cream,
			stroke: C.burgundy,
		}),
	);
	els.push(
		text({
			x: 700,
			y: 460,
			w: 180,
			h: 30,
			content: "Aldı mı?",
			size: 15,
			color: C.burgundy,
		}),
	);

	// Phase 2a: yes
	els.push(
		...arrow({
			x1: 880,
			y1: 475,
			x2: 920,
			y2: 475,
			label: "evet",
			stroke: C.burgundy,
		}),
	);
	els.push(
		...box({
			x: 920,
			y: 435,
			w: 180,
			h: 80,
			label: "Alım kaydı\n(timestamp)",
			fill: C.warm,
			stroke: C.warmDark,
			size: 13,
		}),
	);
	els.push(
		...arrow({ x1: 1010, y1: 515, x2: 1010, y2: 575, stroke: C.inkSoft }),
	);
	els.push(
		...box({
			x: 920,
			y: 575,
			w: 180,
			h: 70,
			label: "PostgreSQL\nintake",
			fill: C.charcoal,
			stroke: C.charcoal,
			textColor: "#ffffff",
			size: 13,
		}),
	);

	// Phase 2b: no
	els.push(
		...arrow({
			x1: 790,
			y1: 520,
			x2: 790,
			y2: 575,
			label: "hayır / zaman aşımı",
			stroke: C.burgundy,
		}),
	);
	els.push(
		...box({
			x: 700,
			y: 575,
			w: 180,
			h: 70,
			label: "Atlandı işaretle\n+ kritik uyarı",
			fill: C.rose,
			stroke: C.burgundy,
			size: 13,
		}),
	);

	// Phase 3
	els.push(sectionLabel("03  BAKICI GÖRÜNÜRLÜĞÜ", 40, 685));
	els.push(
		...box({
			x: 40,
			y: 710,
			w: 220,
			h: 80,
			label: "Uyum istatistikleri\n(haftalık)",
			fill: C.warm,
			stroke: C.warmDark,
			size: 13,
		}),
	);
	els.push(...arrow({ x1: 260, y1: 750, x2: 320, y2: 750, stroke: C.inkSoft }));
	els.push(
		...box({
			x: 320,
			y: 710,
			w: 220,
			h: 80,
			label: "Bakıcı paneli\n(mobil)",
			fill: C.warm,
			stroke: C.warmDark,
			size: 13,
		}),
	);
	els.push(...arrow({ x1: 540, y1: 750, x2: 600, y2: 750, stroke: C.inkSoft }));
	els.push(
		...box({
			x: 600,
			y: 710,
			w: 220,
			h: 80,
			label: "Bakıcı izler\n+ hastayla iletişim",
			fill: C.roseLight,
			stroke: C.burgundy,
			size: 13,
		}),
	);

	// Cross-phase data
	els.push(
		...arrow({
			x1: 790,
			y1: 355,
			x2: 130,
			y2: 435,
			dashed: true,
			label: "kaynak",
			stroke: C.inkSoft,
		}),
	);
	els.push(
		...arrow({
			x1: 1010,
			y1: 645,
			x2: 150,
			y2: 710,
			dashed: true,
			label: "uyum verisi",
			stroke: C.inkSoft,
		}),
	);

	return buildFile(els);
}

const files = [
	["architecture.excalidraw", architecture()],
	["voice-flow.excalidraw", voiceFlow()],
	["medication-flow.excalidraw", medicationFlow()],
];

for (const [name, data] of files) {
	const path = join(__dirname, name);
	writeFileSync(path, JSON.stringify(data, null, 2));
	console.log("wrote", path);
}
