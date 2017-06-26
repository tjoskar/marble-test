import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/scan';
import test from 'ava';
import { Observable } from 'rxjs/Observable';
import { createRxTestScheduler } from '.';
import { rxSchedulerInjector, resetRxScheduler } from './injector';

export const mapToNumber = string$ => string$.map(s => Number(s));
export const valueToValue = value$ => value$.map(v => v);
export const debounceValue = value$ => value$.debounceTime(10);

export const retryOnError = (delayTime: number) =>{
    return (error$: Observable<Error>) => error$
        .scan((errorCount, err) => {
            if (errorCount >= 2) {
                throw err;
            }
            return errorCount + 1;
        }, 0)
        .delay(delayTime);
}

test.afterEach(resetRxScheduler);

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

test('map to the same value', () => {
  // Arrange
  const scheduler = createRxTestScheduler();
  const values = { a: { a: 1 }, b: { b: 2 }, 1: { a: 1 }, 2: { b: 2 } };
  const input =  'a--b|';
  const output = '1--2|';
  const values$ = scheduler.createColdObservable(input, values);

  // Act
  const obs = valueToValue(values$);

  // Assert
  scheduler.expectObservable(obs).toBe(output, values);
  scheduler.flush();
});

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

test('count errors', () => {
  // Arrange
  const scheduler = createRxTestScheduler();
  rxSchedulerInjector(scheduler, 'delay');
  const values = { a: new Error(), b: new Error(), 1: 1, 2: 2 };
  const input =  'a--b|';
  const output = '-1--2|'; // delay with 10 ms
  const error$ = scheduler.createColdObservable(input, values);

  // Act
  const obs = retryOnError(10)(error$);

  // Assert
  scheduler.expectObservable(obs).toBe(output, values);
  scheduler.flush();
});

test('rethrow after 2 tries', () => {
  // Arrange
  const scheduler = createRxTestScheduler();
  rxSchedulerInjector(scheduler, 'delay');
  const error = new Error();
  const values = { a: error, 1: 1, 2: 2 };
  const input =  'a--a--a';
  const output = '1--2--#';
  const error$ = scheduler.createColdObservable(input, values);

  // Act
  const obs = retryOnError(0)(error$);

  // Assert
  scheduler.expectObservable(obs).toBe(output, values, error);
  scheduler.flush();
});

test('unsubscribe after error', () => {
  // Arrange
  const scheduler = createRxTestScheduler();
  rxSchedulerInjector(scheduler, 'delay');
  const error = new Error();
  const values = { a: error, 1: 1, 2: 2 };
  const input =  'a--a--a';
  const output = '1--2--#';
  const error$ = scheduler.createColdObservable(input, values);

  // Act
  const obs = retryOnError(0)(error$);

  // Assert
  scheduler.expectObservable(obs).toBe(output, values, error);
  scheduler.expectSubscriptions(error$.subscriptions).toBe(['^-----!']);
  scheduler.flush();
});
