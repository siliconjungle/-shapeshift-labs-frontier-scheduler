import assert from 'node:assert';
import { createScheduler, deserializeSchedulerState } from '../dist/index.js';

const args = new Set(process.argv.slice(2));
const casesArgIndex = process.argv.indexOf('--cases');
const cases = casesArgIndex >= 0 ? Number(process.argv[casesArgIndex + 1]) : 250;
const seedArgIndex = process.argv.indexOf('--seed');
let seed = seedArgIndex >= 0 ? Number(process.argv[seedArgIndex + 1]) : 0x5eed1234;

for (let run = 0; run < cases; run++) {
  const events = [];
  const handlers = {
    work(ctx) {
      events.push(ctx.input.id);
    }
  };
  let scheduler = createScheduler({
    lanes: [
      { id: 'action', priority: 2, maxQueued: 32, backpressure: 'drop-old' },
      { id: 'render', priority: 1, maxQueued: 32, backpressure: 'replace-key' },
      { id: 'idle', priority: -1, maxQueued: 32, backpressure: 'drop-new' }
    ],
    handlers
  });
  const expectedPending = new Set();
  const cancelled = new Set();
  const taskCount = 10 + randomInt(40);
  for (let i = 0; i < taskCount; i++) {
    const lane = randomPick(['action', 'render', 'idle']);
    const id = `${run}:${i}`;
    try {
      scheduler.schedule({
        id,
        type: 'work',
        lane,
        key: lane === 'render' ? 'row:' + randomInt(8) : id,
        priority: randomPick(['high', 'normal', 'low']),
        input: { id },
        units: 1 + randomInt(3)
      });
      expectedPending.add(id);
    } catch {}
    if (random() < 0.15) {
      const cancelId = `${run}:${randomInt(i + 1)}`;
      if (scheduler.cancel(cancelId, 'fuzz')) {
        cancelled.add(cancelId);
        expectedPending.delete(cancelId);
      }
    }
    if (random() < 0.1) {
      const snapshot = scheduler.serialize({ includeHistory: true });
      scheduler = deserializeSchedulerState(snapshot, { handlers });
    }
    if (random() < 0.25) scheduler.run({ maxTasks: 3, maxUnits: 6 });
  }
  scheduler.run();
  assert.strictEqual(scheduler.getPendingCount(), 0);
  assert.ok(events.every((id) => !cancelled.has(id)));
  assert.ok(scheduler.history().every((record) => record.durationMs >= 0));
}

if (args.has('--json')) {
  console.log(JSON.stringify({ ok: true, cases, seed }, null, 2));
} else {
  console.log(`frontier scheduler fuzz passed (${cases} cases)`);
}

function random() {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 0x100000000;
}

function randomInt(max) {
  return Math.floor(random() * max);
}

function randomPick(values) {
  return values[randomInt(values.length)];
}
