/**
 * Caregiver: Add / Edit Medication for a Patient
 *
 * This is a thin re-export of the shared AddMedicationScreen component.
 * The screen works identically for caregivers — the `useMedicationForm` hook
 * reads `patientId` from the route params and forwards it to every tRPC call,
 * so the medication is created/updated on the correct patient's cabinet.
 *
 * Navigation (from caregiver patient detail screen):
 *   router.push(`/(caregiver)/add-medication?patientId=${patient.id}`)
 */
export { default } from "../(patient)/add-medication";
