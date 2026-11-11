export class ExamresultDTO {
  idExamResult: number = 0;
  idClinicalRecord: number = 0;
  parameterName: string = '';
  resultValue: string = '';
  unit: string | null = null;  // opcional
}
