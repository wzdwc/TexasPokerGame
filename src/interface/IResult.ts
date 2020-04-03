export enum ResultCode {
  SUCCESS = '000000',
  FAILD = '100000',
  UNAUTH = '999999',
}

export interface IResult {
  code: ResultCode;
  data: any;
  message: string;
}
