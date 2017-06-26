> Helps you write marble tests


## Install

```
$ npm install --save-dev marble-test
```


## Example usage

```js
import { createRxTestScheduler } from 'marble-test';

export const mapToNumber$ = string$ => string$.map(s => Number(s));

test('map to number', () => {
  // Arrange
  const scheduler = createRxTestScheduler();
  const values = { a: '1', b: '2', 1: 1, 2: 2 };
  const input =  'a--b|';
  const output = '1--2|';
  const strings$ = scheduler.createColdObservable(input, values);
  
  // Act
  const obs = mapToNumber(strings$);

  // Assert
  scheduler.expectObservable(obs).toBe(output, values);
  scheduler.flush();
});
```
See the [test file](test.ts) for more examples

Gives detailed outputs on assert failure.
e.g., You will get the following output when changing `output` above to `a--2|`

![](/images/error.png)

## Inject your test scheduler

Let's say you have a simple function:
```js
const debounceValue = value$ => value$.debounceTime(10);
```

In order to test this function you need to pass along your test scheduler:

```js
const debounceValue = (value$, scheduler?) => value$.debounceTime(10, scheduler);
```

Unless you use `rxSchedulerInjector` which will inject the scheduler for you:

```js

import 'rxjs/add/operator/debounceTime';
import test from 'ava';
import { Observable } from 'rxjs/Observable';
import { createRxTestScheduler, rxSchedulerInjector } from 'marble-test';

const debounceValue = value$ => value$.debounceTime(10);

test('debounce values', () => {
  // Arrange
  const scheduler = createRxTestScheduler();
  rxSchedulerInjector(scheduler, 'debounceTime');
  const input =  'a--b---|';
  const output = '-a--b--|';
  const values$ = scheduler.createColdObservable(input);

  // Act
  const obs = debounceValue(values$);

  // Assert
  scheduler.expectObservable(obs).toBe(output);
  scheduler.flush();
});
```

This will however monkey patch `Observable.prototype`. You can always reset the methods to the originals with `resetRxScheduler`. eg. `test.afterEach(resetRxScheduler);`

## API

### createRxTestScheduler()

Returns a `TestScheduler` (https://github.com/ReactiveX/rxjs/blob/master/src/testing/TestScheduler.ts)

See https://github.com/ReactiveX/rxjs/blob/master/doc/writing-marble-tests.md for more info

### rxSchedulerInjector(scheduler: TestScheduler, methodName?: string)

##### scheduler

The test scheduler that to typically get from `createRxTestScheduler()`

##### methodName

Name of the method you want to inject. If absent, `rxSchedulerInjector` will inject `debounceTime`, `delay`, `sample` and `throttleTime`.
