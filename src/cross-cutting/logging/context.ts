import { AsyncLocalStorage } from 'node:async_hooks';

export class LoggerContext {
  static context = new AsyncLocalStorage<Map<string, any>>();

  run<R>(fn: () => R, initialContext: Map<string, any> = new Map()): R {
    return LoggerContext.context.run(initialContext, fn);
  }

  set(key: string, value: any): void {
    const store = LoggerContext.context.getStore();
    if (store) {
      store.set(key, value);
    }
  }

  static getContext(): Map<string, any> | undefined {
    return LoggerContext.context.getStore();
  }
}
