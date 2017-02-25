# marble-tests [![Build Status](https://travis-ci.org/tjoskar/marble-tests.svg?branch=master)](https://travis-ci.org/tjoskar/marble-tests)

> Helps you write marble tests


## Install

```
$ npm install --save-dev marble-tests
```


## Example usage

```js
import { createColdObservable, createRxTestScheduler, flush, expectObservable } from 'marble-test';

export const mapToNumber$ = string$ => string$.map(s => Number(s));

test('map to number', () => {
  // Arrange
  createRxTestScheduler();
  const values = { a: '1', b: '2', 1: 1, 2: 2 };
  const input =  'a--b|';
  const output = '1--2|';
  const number$ = createColdObservable(input, values);
  
  // Act
  const obs = mapToNumber$(number$);

  // Assert
  expectObservable(obs).toBe(output, values);
  flush();
});
```
See the [test file](test.ts) for more examples

Gives detailed outputs on assert failure.
You will example get the following output when changing `output` above to `a--2|`

```
  Error:
  Expected
  frame kind    value   hasValue
  0     N       1       true
  30    N       2       true
  40    C       ''      false

  To equal
  frame kind    value   hasValue
  0     N       '1'     true
  30    N       2       true
  40    C       ''      false
``` 
