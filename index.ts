import { TestScheduler } from 'rxjs/testing/TestScheduler';
const chalk = require('chalk');

export const createRxTestScheduler = () => new TestScheduler(assertDeepEqualFrame);

function stringifyFrame(x) {
  let value = x.notification.value === undefined ? '' : x.notification.value;
  if (typeof value === 'string') {
    value = `'${value}'`;
  }
  return `${x.frame}\t${x.notification.kind}\t${value}\t${x.notification.hasValue}`;
}

function isFrameEqual(aFrame, bFrame) {
    const aTime = aFrame.frame;
    const eTime = bFrame.frame;
    const aKind = aFrame.notification.kind;
    const eKind = bFrame.notification.kind;
    const aValue = aFrame.notification.value;
    const eValue = bFrame.notification.value;
    const aHasValue = aFrame.notification.hasValue;
    const eHasValue = bFrame.notification.hasValue;
    const aError = aFrame.notification.error;
    const eError = bFrame.notification.error;
    return (aTime === eTime && aKind === eKind && aValue === eValue && aHasValue === eHasValue && typeof aError === typeof eError);
}

function isFramesEqual(actual, expected) {
  if (!(Array.isArray(actual) && Array.isArray(expected) && actual.length === expected.length)) {
    return false;
  }
  return actual.every((aFrame, i) => isFrameEqual(aFrame, expected[i]));
}

function assertDeepEqualFrame(actual, expected) {
  const equal = isFramesEqual(actual, expected);
  let message = '';
  if (!equal && Array.isArray(actual) && Array.isArray(expected)) {
    message = '\nExpected \n';
    message += 'frame\tkind\tvalue\thasValue\n';
    actual.forEach(x => {
      message += stringifyFrame(x) + '\n';
    });
    message += '\nTo equal \n';
    message += 'frame\tkind\tvalue\thasValue\n';
    expected.forEach((x, i) => {
      message += (isFrameEqual(actual[i], x) ? stringifyFrame(x) : chalk.red(stringifyFrame(x))) + '\n';
    });
  }

  if (!equal) {
    throw new Error(message || 'Frames not equal!');
  }
};
