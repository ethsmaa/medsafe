/**
 * Turkish translations — default language
 */
const tr = {
	// Navigation
	"tab.home": "Ana Sayfa",
	"tab.cabinet": "İlaç Dolabı",
	"tab.calendar": "Takvim",
	"tab.profile": "Profil",

	// Profile & Settings
	"profile.title": "Profil & Ayarlar",
	"profile.accessibility": "Erişilebilirlik",
	"profile.highContrast": "Yüksek Kontrast Modu",
	"profile.highContrastDesc": "Daha iyi görünürlük için renk kontrastını artırır",
	"profile.textSize": "Yazı Boyutu",
	"profile.language": "Dil",
	"profile.languageDesc": "Uygulama dili",
	"profile.theme": "Tema",
	"profile.themeDesc": "Uygulama görünümü",
	"profile.themeLight": "Açık",
	"profile.themeDark": "Koyu",
	"profile.themeSystem": "Sistem",
	"profile.careTeam": "Bakım Ekibim",
	"profile.manageCaregivers": "Bakıcıları Yönet",
	"profile.account": "Hesap",
	"profile.logout": "Çıkış Yap",
	"profile.loggingOut": "Çıkış Yapılıyor...",

	// Add Medication Form
	"med.infoTitle": "İlaç Bilgileri",
	"med.brandName": "Marka Adı",
	"med.brandPlaceholder": "ör. Parol, Augmentin",
	"med.genericName": "Etken Madde",
	"med.genericPlaceholder": "ör. Parasetamol",
	"med.genericOptional": "(isteğe bağlı)",
	"med.form": "Form",
	"med.dosage": "Doz / Miktar",
	"med.dosagePlaceholder": "ör. 500 mg",
	"med.scheduleTitle": "Kullanım Şekli",
	"med.doseCount": "Günde Kaç Kez?",
	"med.mealStatus": "Yemek Durumu",
	"med.mealBefore": "Aç Karnına",
	"med.mealAfter": "Tok Karnına",
	"med.mealWith": "Yemekle",
	"med.mealAny": "Fark Etmez",
	"med.frequency": "Periyot",
	"med.freqDaily": "Her Gün",
	"med.freqWeekly": "Haftalık",
	"med.freqAsNeeded": "Gerektiğinde",
	"med.freqPeriodic": "Periyodik",
	"med.reminderTimes": "Hatırlatma Saatleri",
	"med.addTime": "+ Saat Ekle",
	"med.noTimes": "Henüz saat eklenmedi. \"+ Saat Ekle\" ile hatırlatma ayarlayın.",
	"med.stockTitle": "Stok Takibi",
	"med.currentStock": "Mevcut Stok",
	"med.alertLimit": "Uyarı Limiti",
	"med.save": "İlaç Ekle",
	"med.saveChanges": "Değişiklikleri Kaydet",
	"med.edit": "İlacı Düzenle",
	"med.new": "Yeni İlaç",

	// Validation
	"validation.nameRequired": "Lütfen marka adı veya etken madde giriniz.",
	"validation.dosageRequired": "Lütfen doz/miktar alanını doldurunuz.",
	"validation.error": "Hata",

	// Dashboard
	"dashboard.greeting": "Günaydın",
	"dashboard.todaySchedule": "Bugünkü Program",
	"dashboard.adherence": "Uyum Oranı",
	"dashboard.nextDose": "Sıradaki Doz",
	"dashboard.noDoses": "Bugün planlanmış doz yok",

	// Meds Cabinet
	"cabinet.title": "İlaç Dolabım",
	"cabinet.empty": "Henüz ilaç eklenmemiş",
	"cabinet.addFirst": "İlk ilacınızı ekleyin",
	"cabinet.scanBox": "Kutu Tara",
	"cabinet.addManual": "Manuel Ekle",

	// Calendar
	"calendar.title": "Takvim",
	"calendar.today": "Bugün",
	"calendar.noEvents": "Bu gün için kayıt yok",

	// Scan
	"scan.title": "İlaç Kutusunu Tara",
	"scan.instruction": "İlaç kutusunu kameraya gösterin",
	"scan.analyzing": "Analiz ediliyor...",
	"scan.takePhoto": "Fotoğraf Çek",
	"scan.retake": "Tekrar Çek",
	"scan.useResult": "Bu Sonucu Kullan",

	// Time Picker
	"timePicker.title": "Saat Seç",
	"timePicker.cancel": "İptal",
	"timePicker.confirm": "Onayla",

	// Common
	"common.cancel": "İptal",
	"common.confirm": "Onayla",
	"common.save": "Kaydet",
	"common.delete": "Sil",
	"common.edit": "Düzenle",
	"common.loading": "Yükleniyor...",
} as const;

export type TranslationKey = keyof typeof tr;
export default tr;
