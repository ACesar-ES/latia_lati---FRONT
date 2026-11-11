export class MedicaldocumentsDTO {
  idMedicalDocuments: number = 0;
  documentType: string = '';
  title: string = '';
  fileURL: string = '';
  documentDate: string = '';  // LocalDate -> "yyyy-MM-dd" (usa toIsoDate)
  idHealthProfile: number = 0;
}
