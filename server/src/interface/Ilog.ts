/**
 * 系统日志属性
 */
export interface OSLogField {
  /**
   * 进程识别号
   */
  pid: number;
  /**
   * node 版本号
   */
  nodeVersion: string;
  /**
   * 启动时间
   */
  launchTime: string;
  /**
   * 系统用户名
   */
  osUser: string;
  /**
   * 系统用户id
   */
  osUid: number;
}

/**
 * 业务日志属性
 */
export interface BusinessLogField {
  /**
   * 日志时间戳
   */
  timestamp: string;
  /**
   * 请求时间戳
   */
  requestTime: string;
  /**
   * 请求总数
   */
  total: number;
  /**
   * 请求url
   */
  url: string;
  /**
   * 请求状态码
   */
  status: string;
  /**
   * 请求消耗时间
   */
  fetchConsumeTime: number;
  /**
   * 请求描述
   */
  message: string;
  /**
   * 日志级别
   */
  level: string;
  /**
   * 请求错误栈
   */
  stack: string;
  /**
   * 请求信息
   */
  requestBody?: any;
  /**
   * 请求类型
   */
  method: string;
}
