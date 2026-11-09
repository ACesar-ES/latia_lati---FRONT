export class ClinicalrecordDTO {
  idClinicalRecord?: number;
  idHealthProfile: number = 0;
  recordType: string = '';
  title: string = '';
  description: string = '';
  eventDate: Date = new Date();
  professionalName: string = '';
  idCondition: number = 0;
}
