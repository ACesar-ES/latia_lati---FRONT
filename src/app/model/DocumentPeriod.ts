export class DocumentPeriod {
  constructor(
    public startDate: string,
    public endDate: string,
    public documentType: string = '',
  ) {}
}
