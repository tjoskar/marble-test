import { TestScheduler } from 'rxjs/testing/TestScheduler';
const chalk = require('chalk');
const isEqual = require('lodash.isequal');

export const createRxTestScheduler = () => new TestScheduler(assertDeepEqualFrame);

function stringifyFrame(x) {
  let value = x.notification.value === undefined ? '' : x.notification.value;
  if (typeof value === 'string') {
    value = `'${value}'`;
  }
  return `${x.frame}\t${x.notification.kind}\t${value}\t${x.notification.hasValue}`;
}

function isSameKindOfError(aError, bError) {
    if (typeof aError !== typeof bError) {
        return false;
    }
    if (!aError && !bError && aError === bError) {
        return true;
    }
    return (aError.constructor && bError.constructor && aError.constructor.name === bError.constructor.name);
}

function isFrameEqual(aFrame, bFrame) {
  if (!aFrame || !bFrame) {
    return false;
  }
  const sameTime = aFrame.frame === bFrame.frame;
  const sameKind = aFrame.notification.kind === bFrame.notification.kind;
  const sameValue = isEqual(aFrame.notification.value, bFrame.notification.value);
  const hasValue = aFrame.notification.hasValue === bFrame.notification.hasValue;
  const sameError = isSameKindOfError(aFrame.notification.error, bFrame.notification.error);
  return (sameTime && sameKind && sameValue && hasValue && sameError);
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
