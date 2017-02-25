import { TestScheduler } from 'rxjs/testing/TestScheduler';
import { ColdObservable } from 'rxjs/testing/ColdObservable';
import { HotObservable } from 'rxjs/testing/HotObservable';
const isEqual = require('lodash.isequal');

let rxTestScheduler: TestScheduler = null;

export const getRxTestScheduler = () => rxTestScheduler;
export const createRxTestScheduler = () => rxTestScheduler = new TestScheduler(assertDeepEqualFrame);
export const flush = () => rxTestScheduler.flush();

export function createHotObservable<T>(marbles: string, values?: any) {
  return getRxTestScheduler().createHotObservable<T>(marbles, values);
}

export function createColdObservable<T>(marbles: string, values?: any) {
  return getRxTestScheduler().createColdObservable<T>(marbles, values);
}

export function expectObservable(abservable) {
  return getRxTestScheduler().expectObservable(abservable);
}

export function expectSubscriptions(actualSubscriptionLogs) {
  return getRxTestScheduler().expectSubscriptions(actualSubscriptionLogs);
}

export function stringifyFrame(x) {
  let value = x.notification.value === undefined ? '' : x.notification.value;
  if (typeof value === 'string') {
    value = `'${value}'`;
  }
  return `${x.frame}\t${x.notification.kind}\t${value}\t${x.notification.hasValue}`;
}

function assertDeepEqualFrame(actual, expected) {
  const equal = isEqual(actual, expected);
  let message = '';
  if (!equal && Array.isArray(actual) && Array.isArray(expected)) {
    message = '\nExpected \n';
    message += 'frame\tkind\tvalue\thasValue\n';
    actual.forEach(x => {
      message += stringifyFrame(x) + '\n';
    });
    message += '\nTo equal \n';
    message += 'frame\tkind\tvalue\thasValue\n';
    expected.forEach(x => {
      message += stringifyFrame(x) + '\n';
    });
  }

  if (!equal) {
    throw new Error(message || 'Frames not equal!');
  }
};
