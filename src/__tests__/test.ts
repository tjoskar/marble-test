import { Observable } from 'rxjs'
import { delay, scan, debounceTime, map } from 'rxjs/operators'
import { marble } from '../jest';

export const mapToNumber = (string$: Observable<string | number>) => string$.pipe(map(s => Number(s)))
export const valueToValue = (value$: Observable<any>) => value$.pipe(map(v => v))
export const debounceValue = (value$: Observable<any>) => value$.pipe(debounceTime(10))

export const retryOnError = (delayTime: number) => {
  return (error$: Observable<Error | number>) =>
    error$.pipe(
      scan((errorCount, err) => {
        if (errorCount >= 2) {
          throw err
        }
        return errorCount + 1
      }, 0),
      delay(delayTime)
    )
}

marble('debounce values', m => {
  const input = 'a 10ms b 8ms c 30ms |'
  const output = '10ms a 19ms c 20ms |'
  // const output = '|'
  const values$ = m.cold(input)

  // Act
  const obs = debounceValue(values$)
  // const obs = values$.pipe(x => x)

  // Assert
  m.flush();
  m.expectObservable(obs).toBe(output)
})

marble('map to the same value', m => {
  // Arrange
  const values = { a: { a: 1 }, b: { b: 2 }, 1: { a: 1 }, 2: { b: 2 } }
  const input = 'a--b|'
  const output = '1--2|'
  const values$ = m.cold(input, values)

  // Act
  const obs = valueToValue(values$)

  // Assert
  m.expectObservable(obs).toBe(output, values)
})

marble('map to number', m => {
  // Arrange
  const values = { a: '1', b: '2', 1: 1, 2: 2 }
  const input = 'a--b|'
  const output = '1--2|'
  const strings$ = m.cold(input, values)

  // Act
  const obs = mapToNumber(strings$)

  // Assert
  m.expectObservable(obs).toBe(output, values)
})

marble('count errors', m => {
  // Arrange
  const values = { a: new Error(), b: new Error(), 1: 1, 2: 2 }
  const input = 'a--b|'
  const output = '-1--2|' // delay with 1 ms
  const error$ = m.cold(input, values)

  // Act
  const obs = retryOnError(1)(error$ as any)

  // Assert
  m.expectObservable(obs).toBe(output, values)
})

marble('rethrow after 2 tries', m => {
  // Arrange
  const error = new Error()
  const values = { a: error, 1: 1, 2: 2 }
  const input = 'a--a--a'
  const output = '1--2--#'
  const error$ = m.cold(input, values)

  // Act
  const obs = retryOnError(0)(error$ as any)

  // Assert
  m.expectObservable(obs).toBe(output, values, error)
})

marble('unsubscribe after error', m => {
  // Arrange
  const error = new Error()
  const values = { a: error, 1: 1, 2: 2 }
  const input = 'a--a--a'
  const output = '1--2--#'
  const error$ = m.cold(input, values)

  // Act
  const obs = retryOnError(0)(error$ as any)

  // Assert
  m.expectObservable(obs).toBe(output, values, error)
  m.expectSubscriptions(error$.subscriptions).toBe(['^-----!'])
})
