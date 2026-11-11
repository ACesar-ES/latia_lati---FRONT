export class UsersResponseDTO {
  idUser!: number;
  firstName: string = '';
  lastName: string = '';
  username: string = '';
  email: string = '';
  active: boolean = true;
  createdAt?: string;
  updatedAt?: string;
}