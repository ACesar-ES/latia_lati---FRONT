export class UsersRequestDTO {
  idUser?: number;
  firstName: string = '';
  lastName: string = '';
  username: string = '';
  email: string = '';
  passwordHash: string = '';
  active: boolean = true;
}