/**
 * Turkish translations — default language
 */
const tr = {
	// Navigation
	"tab.home": "Ana Sayfa",
	"tab.cabinet": "İlaç Dolabı",
	"tab.calendar": "Takvim",
	"tab.assistant": "Asistan",
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

	// AI Not Kartı
	"med.aiNote.title": "AI İlaç Notu",
	"med.aiNote.subtitle": "Prospektüs bilgisini otomatik sadeleştirir",
	"med.aiNote.generate": "AI İlaç Notu Oluştur",
	"med.aiNote.regenerate": "Yeniden Oluştur",
	"med.aiNote.generating": "AI Notu Oluşturuluyor...",
	"med.aiNote.label": "Notlar",
	"med.aiNote.placeholder": "Not oluşturmak için butona basın...",
	"med.aiNote.disclaimer": "Bu not AI tarafından üretilmiştir. Doktorunuza veya eczacınıza danışın.",
	"med.aiNote.noName": "Lütfen önce bir marka adı veya etken madde girin.",

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
	"cabinet.selected": "Seçili",
	"cabinet.deleteSelected": "Seçilenleri Sil",
	"cabinet.cancelSelection": "İptal",

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

	// Bakıcı Aktivite Günlüğü
	"log.title": "Aktivite Günlüğü",
	"log.subtitle": "Hastalarınızın son aksiyonları",
	"log.empty": "Henüz aktivite yok",
	"log.emptyDesc": "Hastalarınızdan gelen aktiviteler burada görünecek",
	"log.statusTaken": "Aldı",
	"log.statusSkipped": "Atladı",
	"log.statusMissed": "Kaçırdı",
	"log.onTime": "Zamanında",
	"log.late": "Geç",
	"log.today": "Bugün",
	"log.yesterday": "Dün",

	// Bakıcı Dashboard
	"cg.dashboard": "Kontrol Paneli",
	"cg.managePatients": "Hastalarınızı yönetin",
	"cg.activePatients": "Aktif Hastalalar",
	"cg.pendingAlerts": "Bekleyen Uyarılar",
	"cg.invitePatient": "Hasta Davet Et",
	"cg.inviteDesc": "E-posta ile davet gönderin",
	"cg.patientEmail": "Hasta E-posta",
	"cg.sendInvite": "Davet Gönder",
	"cg.quickActions": "Hızlı İşlemler",
	"cg.viewAllPatients": "Tüm Hastaları Gör",
	"cg.checkAlerts": "Uyarıları Kontrol Et",
	"cg.allPatients": "Tüm Hastalar",
	"cg.addMedication": "İlaç Ekle",
	"cg.patientDetails": "Hasta Detayları",
	"cg.medications": "İlaçlar",
	"cg.noMedications": "Henüz ilaç eklenmemiş",

	// Asistan
	"assistant.title": "Sağlık Asistanı",
	"assistant.welcomeMessage": "Merhaba! İlaçlarınız hakkında sorularınızı yanıtlayabilirim. Neler sormak istersiniz?",
	"assistant.inputPlaceholder": "Mesajınızı yazın...",
	"assistant.suggestion1": "\"Bugün ilacımı içtim mi?\"",
	"assistant.suggestion2": "\"Bir sonraki ilacım ne zaman?\"",
	"assistant.suggestion3": "\"İlaç stoğum ne durumda?\"",
} as const;

export type TranslationKey = keyof typeof tr;
export default tr;
