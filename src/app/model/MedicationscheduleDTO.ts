export class MedicationscheduleDTO {
  idMedicationSchedule: number = 0;
  idTreatment: number = 0;
  reminderTime: string = '';  // LocalDateTime -> "yyyy-MM-ddTHH:mm:ss" (usa toLocalDateTime)
  intervalHours: number = 1;
}
