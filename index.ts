import { TestScheduler } from 'rxjs/testing/TestScheduler';
const isEqual = require('lodash.isequal');

export const createRxTestScheduler = () => new TestScheduler(assertDeepEqualFrame);

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
