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
  const number$ = scheduler.createColdObservable(input, values);
  
  // Act
  const obs = mapToNumber(number$);

  // Assert
  scheduler.expectObservable(obs).toBe(output, values);
  scheduler.flush();
});
```
See the [test file](test.ts) for more examples

Gives detailed outputs on assert failure.
e.g., You will get the following output when changing `output` above to `a--2|`

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
