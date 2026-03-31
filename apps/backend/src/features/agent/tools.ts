import { SchemaType } from "@google/generative-ai";
import type {
	FunctionDeclaration,
	FunctionDeclarationsTool,
} from "@google/generative-ai";

/**
 * Gemini Function Calling tool definitions.
 * Each tool maps to a Prisma query in tool-handlers.ts.
 */

const getTodayIntakeStatus: FunctionDeclaration = {
	name: "get_today_intake_status",
	description:
		"Hastanın bugün belirli bir ilacı alıp almadığını kontrol eder. İlaç adı verilmezse bugünkü tüm alım durumunu döndürür.",
	parameters: {
		type: SchemaType.OBJECT,
		properties: {
			medicationName: {
				type: SchemaType.STRING,
				description: "Sorgulanacak ilaç adı (opsiyonel, boş bırakılırsa tümü döner)",
			},
		},
	},
};

const getMedicationList: FunctionDeclaration = {
	name: "get_medication_list",
	description: "Hastanın aktif ilaç listesini döndürür.",
	parameters: {
		type: SchemaType.OBJECT,
		properties: {},
	},
};

const getNextDose: FunctionDeclaration = {
	name: "get_next_dose",
	description:
		"Hastanın bugün henüz almadığı bir sonraki ilacını ve saatini döndürür.",
	parameters: {
		type: SchemaType.OBJECT,
		properties: {},
	},
};

const getMedicationUsageInfo: FunctionDeclaration = {
	name: "get_medication_usage_info",
	description:
		"Belirli bir ilacın kullanım talimatını döndürür (doz, aç/tok karnına, talimatlar).",
	parameters: {
		type: SchemaType.OBJECT,
		properties: {
			medicationName: {
				type: SchemaType.STRING,
				description: "Bilgi istenen ilaç adı",
			},
		},
		required: ["medicationName"],
	},
};

const getMedicationDuration: FunctionDeclaration = {
	name: "get_medication_duration",
	description:
		"Hastanın belirli bir ilacı kaç gündür kullandığını ve kalan dozunu döndürür.",
	parameters: {
		type: SchemaType.OBJECT,
		properties: {
			medicationName: {
				type: SchemaType.STRING,
				description: "Süre hesaplanacak ilaç adı",
			},
		},
		required: ["medicationName"],
	},
};

const logSideEffect: FunctionDeclaration = {
	name: "log_side_effect",
	description:
		"Hastanın yaşadığı yan etkiyi kaydeder. Hasta 'midem bulandı', 'başım ağrıdı' gibi bir şey söylediğinde bu aracı kullan.",
	parameters: {
		type: SchemaType.OBJECT,
		properties: {
			description: {
				type: SchemaType.STRING,
				description: "Yan etkinin açıklaması (hastanın kendi sözleriyle)",
			},
			medicationName: {
				type: SchemaType.STRING,
				description: "İlişkili ilaç adı (opsiyonel)",
			},
			severity: {
				type: SchemaType.STRING,
				description: "Şiddet seviyesi: mild, moderate veya severe (opsiyonel)",
			},
		},
		required: ["description"],
	},
};

const getAdherenceSummary: FunctionDeclaration = {
	name: "get_adherence_summary",
	description:
		"Hastanın son 7 gündeki ilaç uyum özetini döndürür (kaçırılan dozlar, uyum yüzdesi).",
	parameters: {
		type: SchemaType.OBJECT,
		properties: {},
	},
};

const getStockStatus: FunctionDeclaration = {
	name: "get_stock_status",
	description:
		"Hastanın ilaç stoğunu kontrol eder ve tahmini bitiş süresini hesaplar.",
	parameters: {
		type: SchemaType.OBJECT,
		properties: {
			medicationName: {
				type: SchemaType.STRING,
				description: "Stok kontrol edilecek ilaç adı (opsiyonel, boş bırakılırsa tümü)",
			},
		},
	},
};

const recordMedicationIntake: FunctionDeclaration = {
	name: "record_medication_intake",
	description:
		"Hastanın bir ilacı aldığını (veya atladığını) kaydeder. 'İlacımı içtim', 'Parol aldım', 'X ilacımı atladım' gibi ifadelerde kullanılır.",
	parameters: {
		type: SchemaType.OBJECT,
		properties: {
			medicationName: {
				type: SchemaType.STRING,
				description: "Kaydedilecek ilaç adı",
			},
			status: {
				type: SchemaType.STRING,
				description: "Alım durumu: TAKEN (alındı) veya SKIPPED (atlandı)",
			},
			takenAt: {
				type: SchemaType.STRING,
				description:
					"İlacın alındığı zaman (ISO formatında, opsiyonel, varsayılan şimdiki zaman)",
			},
		},
		required: ["medicationName", "status"],
	},
};

export const agentTools: FunctionDeclarationsTool[] = [
	{
		functionDeclarations: [
			getTodayIntakeStatus,
			getMedicationList,
			getNextDose,
			getMedicationUsageInfo,
			getMedicationDuration,
			logSideEffect,
			getAdherenceSummary,
			getStockStatus,
			recordMedicationIntake,
		],
	},
];
