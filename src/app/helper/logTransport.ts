import { LoggerLevel, Context } from 'egg';
import { FileBufferTransport } from 'egg-logger';
import * as iconv from 'iconv-lite';
import * as moment from 'moment';
import * as os from 'os';
import { OSLogField, BusinessLogField } from '../../interface/Ilog';

const { uid, username } = os.userInfo();

/**
 * 日志格式化
 */
class LogFormat extends Map {
  logField: BusinessLogField;
  osField: OSLogField;
  constructor() {
    super();
    this.osField = {
      pid: process.pid,
      nodeVersion: process.version,
      launchTime: moment().format('YYYY-MM-DD HH:mm:ss'),
      osUser: username,
      osUid: uid,
    };
  }

  /**
   * Log日志进行utf-8编码
   */
  protected toBuffer() {
    const fields = { ...this.osField, ...this.logField };
    const str = JSON.stringify(fields) + '\n';
    return iconv.encode(str, 'utf8');
  }

  /**
   * 格式化Log上下文
   * @param logInfo
   * @param level 日志级别
   */
  public formatFetchInfoMsg(logInfo: any[], level: LoggerLevel) {
    const collect = logInfo[0];
    this.logField = {
      fetchConsumeTime: 0,
      level: '',
      message: '',
      requestTime: '',
      stack: '',
      status: '',
      timestamp: '',
      total: 0,
      requestBody: {},
      method: '',
      url: '',
    };
    if (typeof collect === 'string') {
      this.logField.message = collect;
      this.logField.requestTime = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
      this.logField.level = level;
      this.logField.stack = level === 'ERROR' ? logInfo[1] : '';
    } else {
      this.logField.timestamp = collect.startTime;
      this.logField.requestTime = moment(collect.startTime).format('YYYY-MM-DD HH:mm:ss');
      this.logField.status = collect.status;
      this.logField.message = collect.message;
      this.logField.stack = collect.stack;
      this.logField.level = collect.level || level;
      this.logField.url = collect.url;
      this.logField.total = collect.end - collect.start;
      if (collect.fetchStart && collect.fetchEnd) {
        this.logField.requestBody = collect.requestBody;
        this.logField.method = collect.method;
        this.logField.fetchConsumeTime = collect.fetchEnd - collect.fetchStart;
      }
    }
    return this.toBuffer();
  }
}

export default class ElkTransport extends FileBufferTransport {

  log(this: Context, level: LoggerLevel, args: any) {
    const logFormat = new LogFormat();
    let buf;
    if (!this._stream) {
      const err = new Error(`${this.options.file} log stream had been closed`);
      console.error(err.stack);
      return;
    }
    buf = logFormat.formatFetchInfoMsg(args, level);
    if (buf.length) {
      this._write(buf);
    }
  }
}
