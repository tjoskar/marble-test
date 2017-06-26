import { TestScheduler } from 'rxjs/testing/TestScheduler';
import { Observable } from 'rxjs/Observable';

const originals = Object.assign({}, Observable.prototype);

function inject(scheduler: TestScheduler, method?: string) {
  function stubWithScheduler<T>(this: Observable<T>, ...args) {
    return originals[method].call(this, ...args, scheduler);
  }
  Observable.prototype[method] = stubWithScheduler;
}

export function rxSchedulerInjector(scheduler: TestScheduler, method?: string) {
  if (method && !(method in originals)) {
    console.log(`Unable to inject ${method}. Make sure it is imported, or create an issue on https://github.com/tjoskar/marble-test`);
    return;
  }
  if (method) {
    inject(scheduler, method);
  } else {
    ['debounceTime', 'delay', 'sample', 'throttleTime'].forEach(methodName => inject(scheduler, methodName));
  }
}

export function resetRxScheduler() {
  Object.assign(Observable.prototype, originals);
}
