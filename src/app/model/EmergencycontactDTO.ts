export class EmergencycontactDTO {
  idEmergencyContact: number = 0;
  idHealthProfile: number = 0;
  name: string = '';  // máx. 150 caracteres
  phone: string = '';  // 7 a 15 dígitos, puede empezar con +
  relationship: string = '';  // máx. 80 caracteres
  primaryContact: boolean = false;
  createdAt: string | null = null;  // solo respuesta
  updatedAt: string | null = null;  // solo respuesta
}
