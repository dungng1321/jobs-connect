export class ResponseData<D> {
  statusCode: number;
  message: string;
  data: D | D[];
  constructor(statusCode: number, message: string, data: D | D[]) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}
