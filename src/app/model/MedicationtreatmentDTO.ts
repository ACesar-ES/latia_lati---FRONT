export class MedicationtreatmentDTO {
  idMedicationTreatment: number = 0;
  idClinicalRecord: number = 0;
  idMedication: number = 0;
  dose: string = '';  // máx. 100 caracteres
  administrationRoute: string = '';  // máx. 80 caracteres
  startDate: string = '';  // LocalDate -> "yyyy-MM-dd" (usa toIsoDate)
  endDate: string | null = null;  // LocalDate opcional
}
