export class HealthprofileDTO {
  idHealthProfile: number = 0;
  idOwnerUser: number = 0;
  idHolderUser: number | null = null;  // opcional
  birthDate: string = '';  // LocalDate -> "yyyy-MM-dd" (usa toIsoDate)
  sex: string = '';
  bloodType: string = '';
  phone: string = '';
  active: boolean = true;
}
