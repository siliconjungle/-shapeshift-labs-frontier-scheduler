import fs from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { createScheduler, deserializeSchedulerState } from '../dist/index.js';

const outIndex = process.argv.indexOf('--out');
const outPath = outIndex >= 0 ? process.argv[outIndex + 1] : undefined;

const rows = [];
rows.push(bench('schedule-run-1k', () => {
  const scheduler = createScheduler({
    lanes: [
      { id: 'action', priority: 2 },
      { id: 'render', priority: 1, backpressure: 'replace-key', maxQueued: 2048 }
    ],
    handlers: { work() {} }
  });
  for (let i = 0; i < 1000; i++) {
    scheduler.schedule({
      id: 'task-' + i,
      type: 'work',
      lane: i % 3 === 0 ? 'action' : 'render',
      key: 'key:' + i,
      input: { i },
      priority: i % 5 === 0 ? 'high' : 'normal'
    });
  }
  scheduler.run();
}));
rows.push(bench('serialize-restore-1k', () => {
  const handlers = { work() {} };
  const scheduler = createScheduler({ handlers });
  for (let i = 0; i < 1000; i++) scheduler.schedule({ id: 'task-' + i, type: 'work', input: { i } });
  const snapshot = scheduler.serialize({ includeHistory: true });
  deserializeSchedulerState(snapshot, { handlers });
}));
rows.push(bench('inspect-graph-1k', () => {
  const scheduler = createScheduler({ handlers: { work() {} } });
  for (let i = 0; i < 1000; i++) {
    scheduler.schedule({
      id: 'task-' + i,
      type: 'work',
      key: 'item:' + (i % 128),
      causeId: 'cause:' + (i % 16),
      parentId: i > 0 ? 'task-' + (i - 1) : undefined
    });
  }
  scheduler.inspect();
}));

const result = {
  package: '@shapeshift-labs/frontier-scheduler',
  generatedAt: new Date().toISOString(),
  rows
};

if (outPath) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2) + '\n');
}

for (const row of rows) {
  console.log(`${row.name}: ${row.opsPerSec.toFixed(0)} ops/s (${row.meanMs.toFixed(3)} ms)`);
}

function bench(name, fn) {
  for (let i = 0; i < 20; i++) fn();
  const samples = [];
  for (let i = 0; i < 80; i++) {
    const start = performance.now();
    fn();
    samples.push(performance.now() - start);
  }
  samples.sort((a, b) => a - b);
  const meanMs = samples.reduce((sum, value) => sum + value, 0) / samples.length;
  return {
    name,
    iterations: samples.length,
    meanMs,
    medianMs: samples[Math.floor(samples.length / 2)],
    p95Ms: samples[Math.floor(samples.length * 0.95)],
    opsPerSec: 1000 / meanMs
  };
}
