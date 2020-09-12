import { Context } from 'egg';

const LOG_COLLECTION = Symbol('Context#logCollection');
export default {
  context: this,
  /**
   * Get log
   * @returns {any}
   */
  getLogs(this: Context) {
    const result: any = {};
    for (const [ k, val ] of this.logCollection) {
      result[k] = val;
    }
    return result;
  },
  /**
   * Collect log info
   * @param {string} key
   * @param {string} value
   */
  setLogCollection(this: Context, key: string, value: string) {
    this.logCollection.set(key, value);
  },
  get logCollection(this: Context) {
    if (!this.context[LOG_COLLECTION]) {
      this.context[LOG_COLLECTION] = new Map();
    }
    return this.context[LOG_COLLECTION];
  },
  set logCollection(this: Context, value) {
    this.context[LOG_COLLECTION] = value;
  },
};
