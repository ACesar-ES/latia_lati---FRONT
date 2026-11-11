export class FamilyrelationshipDTO {
  idFamilyRelationship: number = 0;
  idOriginProfile: number = 0;  // perfil de quien arma el árbol
  idRelativeProfile: number = 0;  // perfil del familiar
  relationshipType: string = '';  // máx. 30 caracteres
}
