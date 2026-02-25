import type { TranslationKey } from "./tr";

const en: Record<TranslationKey, string> = {
	// Navigation
	"tab.home": "Home",
	"tab.cabinet": "Cabinet",
	"tab.calendar": "Calendar",
	"tab.profile": "Profile",

	// Profile & Settings
	"profile.title": "Profile & Settings",
	"profile.accessibility": "Accessibility",
	"profile.highContrast": "High Contrast Mode",
	"profile.highContrastDesc": "Increase color contrast for better visibility",
	"profile.textSize": "Text Size",
	"profile.language": "Language",
	"profile.languageDesc": "App language",
	"profile.theme": "Theme",
	"profile.themeDesc": "App appearance",
	"profile.themeLight": "Light",
	"profile.themeDark": "Dark",
	"profile.themeSystem": "System",
	"profile.careTeam": "My Care Team",
	"profile.manageCaregivers": "Manage Caregivers",
	"profile.account": "Account",
	"profile.logout": "Log Out",
	"profile.loggingOut": "Logging Out...",

	// Add Medication Form
	"med.infoTitle": "Medication Details",
	"med.brandName": "Brand Name",
	"med.brandPlaceholder": "e.g. Parol, Augmentin",
	"med.genericName": "Generic Name",
	"med.genericPlaceholder": "e.g. Paracetamol",
	"med.genericOptional": "(optional)",
	"med.form": "Form",
	"med.dosage": "Dosage / Strength",
	"med.dosagePlaceholder": "e.g. 500 mg",
	"med.scheduleTitle": "Schedule",
	"med.doseCount": "Times per Day?",
	"med.mealStatus": "Meal Instructions",
	"med.mealBefore": "Before Meal",
	"med.mealAfter": "After Meal",
	"med.mealWith": "With Food",
	"med.mealAny": "Any Time",
	"med.frequency": "Frequency",
	"med.freqDaily": "Daily",
	"med.freqWeekly": "Weekly",
	"med.freqAsNeeded": "As Needed",
	"med.freqPeriodic": "Periodic",
	"med.reminderTimes": "Reminder Times",
	"med.addTime": "+ Add Time",
	"med.noTimes": "No times set. Tap \"+ Add Time\" to schedule reminders.",
	"med.stockTitle": "Inventory Tracking",
	"med.currentStock": "Current Stock",
	"med.alertLimit": "Alert Limit",
	"med.save": "Add Medication",
	"med.saveChanges": "Save Changes",
	"med.edit": "Edit Medication",
	"med.new": "New Medication",

	// Validation
	"validation.nameRequired": "Please enter a brand name or generic name.",
	"validation.dosageRequired": "Please fill in the dosage field.",
	"validation.error": "Error",

	// Dashboard
	"dashboard.greeting": "Good Morning",
	"dashboard.todaySchedule": "Today's Schedule",
	"dashboard.adherence": "Adherence Rate",
	"dashboard.nextDose": "Next Dose",
	"dashboard.noDoses": "No doses scheduled for today",

	// Meds Cabinet
	"cabinet.title": "My Cabinet",
	"cabinet.empty": "No medications added yet",
	"cabinet.addFirst": "Add your first medication",
	"cabinet.scanBox": "Scan Box",
	"cabinet.addManual": "Add Manually",

	// Calendar
	"calendar.title": "Calendar",
	"calendar.today": "Today",
	"calendar.noEvents": "No records for this day",

	// Scan
	"scan.title": "Scan Medication Box",
	"scan.instruction": "Point your camera at the medication box",
	"scan.analyzing": "Analyzing...",
	"scan.takePhoto": "Take Photo",
	"scan.retake": "Retake",
	"scan.useResult": "Use This Result",

	// Time Picker
	"timePicker.title": "Select Time",
	"timePicker.cancel": "Cancel",
	"timePicker.confirm": "Confirm",

	// Common
	"common.cancel": "Cancel",
	"common.confirm": "Confirm",
	"common.save": "Save",
	"common.delete": "Delete",
	"common.edit": "Edit",
	"common.loading": "Loading...",
};

export default en;
