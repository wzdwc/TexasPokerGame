export enum ResultCode {
  SUCCESS = "000000",
  FAIL = "100000",
  ONT_AUTH = "999999",
}

export interface IResult {
  code: ResultCode;
  data: any;
  message: string;
}
