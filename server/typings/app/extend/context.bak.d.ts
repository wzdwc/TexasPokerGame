// This file is created by egg-ts-helper
// Do not modify this file!!!!!!!!!
import 'egg';
import ExtendTsContext from '../../../src/app/extend/context.bak';
type ExtendTsContextType = typeof ExtendTsContext;
declare module 'egg' {
  interface Context extends ExtendTsContextType { }
}