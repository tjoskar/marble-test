import { TestScheduler } from 'rxjs/testing/TestScheduler';
const chalk = require('chalk');
const isEqual = require('lodash.isequal');
const Table = require('easy-table');

export const createRxTestScheduler = () => new TestScheduler(assertDeepEqualFrame);

function frameRow(x) {
  let value = x.notification.value === undefined ? '' : x.notification.value;
  if (typeof value === 'string') {
    value = `'${value}'`;
  } else if (typeof value === 'object') {
    value = JSON.stringify(value);
  }
  return {
    frame: x.frame,
    kind: x.notification.kind,
    value: value,
    hasValue: x.notification.hasValue
  };
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

function createTableRow(table, frame, decoration = v => v) {
  table.cell('frame', decoration(frame.frame));
  table.cell('kind', decoration(frame.kind));
  table.cell('value', frame.hasValue ? decoration(frame.value) : undefined);
  table.cell('hasValue', decoration(frame.hasValue));
  table.newRow();
}

function assertDeepEqualFrame(actual, expected) {
  const equal = isFramesEqual(actual, expected);
  if (!equal) {
    const actualTable = new Table();
    const expectedTable = new Table();
    actual
      .map(frameRow)
      .forEach(frame => {
        createTableRow(actualTable, frame);
      });
    expected
      .forEach((x, i) => {
        const frame = frameRow(x);
        if (isFrameEqual(actual[i], x)) {
          createTableRow(expectedTable, frame, chalk.green);
        } else {
          createTableRow(expectedTable, frame, chalk.red);
        }
      });
    const message = '\nExpected \n' + actualTable.toString() + '\nTo equal \n' + expectedTable.toString();
    throw new Error(message);
  }
};
