> Helps you write marble tests

## Install

```
$ npm install --save-dev marble-test
```

## Example usage

```js
import { createRxTestScheduler } from 'marble-test'

const mapToNumber$ = string$ => string$.pipe(map(s => Number(s)))

test('map to number', () => {
  // Arrange
  const scheduler = createRxTestScheduler()
  const values = { a: '1', b: '2', 1: 1, 2: 2 }
  const input = 'a--b|'
  const output = '1--2|'
  const strings$ = scheduler.createColdObservable(input, values)

  // Act
  const obs = mapToNumber$(strings$)

  // Assert
  scheduler.expectObservable(obs).toBe(output, values)
  scheduler.flush()
})
```

### With jest

```js
import { marble } from 'marble-test/jest'

const mapToNumber$ = string$ => string$.pipe(map(s => Number(s)))

marble('map to number', m => {
  // Arrange
  const values = { a: '1', b: '2', 1: 1, 2: 2 }
  const input = 'a--b|'
  const output = '1--2|'
  const strings$ = m.cold(input, values)

  // Act
  const obs = mapToNumber$(strings$)

  // Assert
  m.expectObservable(obs).toBe(output, values)
})
```

See the [test file](src/__tests__/test.ts) for more examples

Gives detailed outputs on assert failure.
e.g., You will get the following output when changing `output` above to `a--2|`

![](/images/error.png)

## API

### createRxTestScheduler()

Returns a `TestScheduler` (https://github.com/ReactiveX/rxjs/blob/master/src/testing/TestScheduler.ts)

See https://github.com/ReactiveX/rxjs/blob/master/doc/writing-marble-tests.md for more info
