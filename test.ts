import test from 'ava'
import { Observable, throwError } from 'rxjs'
import { delay, scan, debounceTime, map } from 'rxjs/operators'
import { TestScheduler } from 'rxjs/testing'
import { createRxTestScheduler } from '.'

export const mapToNumber = string$ => string$.pipe(map(s => Number(s)))
export const valueToValue = value$ => value$.pipe(map(v => v))
export const debounceValue = (value$, scheduler?) =>
  value$.pipe(debounceTime(10, scheduler))

export const retryOnError = (delayTime: number, scheduler?: TestScheduler) => {
  return (error$: Observable<Error | number>) =>
    error$.pipe(
      scan((errorCount, err) => {
        if (errorCount >= 2) {
          throw err
        }
        return errorCount + 1
      }, 0),
      delay(delayTime, scheduler)
    )
}

test('debounce values', t => {
  // Arrange
  t.plan(0)
  const scheduler = createRxTestScheduler()
  const input = 'a--b---|'
  const output = '-a--b--|'
  const values$ = scheduler.createColdObservable(input)

  // Act
  const obs = debounceValue(values$, scheduler)

  // Assert
  scheduler.expectObservable(obs).toBe(output)
  scheduler.flush()
})

test('map to the same value', t => {
  // Arrange
  t.plan(0)
  const scheduler = createRxTestScheduler()
  const values = { a: { a: 1 }, b: { b: 2 }, 1: { a: 1 }, 2: { b: 2 } }
  const input = 'a--b|'
  const output = '1--2|'
  const values$ = scheduler.createColdObservable(input, values)

  // Act
  const obs = valueToValue(values$)

  // Assert
  scheduler.expectObservable(obs).toBe(output, values)
  scheduler.flush()
})

test('map to number', t => {
  // Arrange
  t.plan(0)
  const scheduler = createRxTestScheduler()
  const values = { a: '1', b: '2', 1: 1, 2: 2 }
  const input = 'a--b|'
  const output = '1--2|'
  const strings$ = scheduler.createColdObservable(input, values)

  // Act
  const obs = mapToNumber(strings$)

  // Assert
  scheduler.expectObservable(obs).toBe(output, values)
  scheduler.flush()
})

test('count errors', t => {
  // Arrange
  t.plan(0)
  const scheduler = createRxTestScheduler()
  const values = { a: new Error(), b: new Error(), 1: 1, 2: 2 }
  const input = 'a--b|'
  const output = '-1--2|' // delay with 10 ms
  const error$ = scheduler.createColdObservable(input, values)

  // Act
  const obs = retryOnError(10, scheduler)(error$ as any)

  // Assert
  scheduler.expectObservable(obs).toBe(output, values)
  scheduler.flush()
})

test('rethrow after 2 tries', t => {
  // Arrange
  t.plan(0)
  const scheduler = createRxTestScheduler()
  const error = new Error()
  const values = { a: error, 1: 1, 2: 2 }
  const input = 'a--a--a'
  const output = '1--2--#'
  const error$ = scheduler.createColdObservable(input, values)

  // Act
  const obs = retryOnError(0, scheduler)(error$ as any)

  // Assert
  scheduler.expectObservable(obs).toBe(output, values, error)
  scheduler.flush()
})

test('unsubscribe after error', t => {
  // Arrange
  t.plan(0)
  const scheduler = createRxTestScheduler()
  const error = new Error()
  const values = { a: error, 1: 1, 2: 2 }
  const input = 'a--a--a'
  const output = '1--2--#'
  const error$ = scheduler.createColdObservable(input, values)

  // Act
  const obs = retryOnError(0, scheduler)(error$ as any)

  // Assert
  scheduler.expectObservable(obs).toBe(output, values, error)
  scheduler.expectSubscriptions(error$.subscriptions).toBe(['^-----!'])
  scheduler.flush()
})
