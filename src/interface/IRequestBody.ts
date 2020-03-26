export enum ProductType {
  /**
   * 网贷（二部产品）
   */
  WEB_LOAN,
  /**
   * 信用卡贷款（一部产品）
   */
  CREDIT_CARD,
}

export interface IRequestBody {
  head: any;
  body: any;
}
