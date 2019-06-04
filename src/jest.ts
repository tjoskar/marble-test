import { RunHelpers } from "rxjs/internal/testing/TestScheduler";
import { createRxTestScheduler } from ".";

export function marble(testName: string, testFn: ((m: RunHelpers) => void)) {
  test(testName, () => {
    const scheduler = createRxTestScheduler();
    scheduler.run(testFn);
  })
}
