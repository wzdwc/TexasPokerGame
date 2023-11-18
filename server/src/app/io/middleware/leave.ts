import { Context } from "@midwayjs/web";

export default function leave(): any {
  return async (ctx: Context, next: () => Promise<any>) => {};
}
