import assert from 'node:assert';
import {
  FrontierSchedulerBackpressureError,
  FrontierSchedulerDroppedError,
  createScheduler,
  deserializeSchedulerState,
  summarizeSchedulerThroughput
} from '../dist/index.js';

{
  const order = [];
  const scheduler = createScheduler({
    lanes: [
      { id: 'action', priority: 'critical' },
      { id: 'render', priority: 'high' }
    ]
  });
  scheduler.schedule({ id: 'render-1', type: 'render', lane: 'render', run: () => order.push('render') });
  scheduler.schedule({ id: 'action-1', type: 'action', lane: 'action', run: () => order.push('action') });
  scheduler.schedule({ id: 'after-action', type: 'followup', lane: 'action', dependsOn: ['action-1'], run: () => order.push('followup') });

  const result = scheduler.run();
  assert.deepStrictEqual(order, ['action', 'followup', 'render']);
  assert.strictEqual(result.completed, 3);
  assert.strictEqual(result.pending, 0);
}

{
  const scheduler = createScheduler({
    lanes: [{ id: 'layout', maxUnitsPerRun: 2 }]
  });
  scheduler.schedule({ id: 'a', lane: 'layout', units: 1, run() {} });
  scheduler.schedule({ id: 'b', lane: 'layout', units: 1, run() {} });
  scheduler.schedule({ id: 'c', lane: 'layout', units: 1, run() {} });

  const first = scheduler.run();
  assert.strictEqual(first.completed, 2);
  assert.strictEqual(first.pending, 1);
  assert.strictEqual(first.blocked, 1);
  const second = scheduler.run();
  assert.strictEqual(second.completed, 1);
  assert.strictEqual(second.pending, 0);
}

{
  const scheduler = createScheduler({
    lanes: [{ id: 'render', maxQueued: 2, backpressure: 'replace-key' }]
  });
  scheduler.schedule({ id: 'row-a-1', lane: 'render', key: 'row:a', run() {} });
  scheduler.schedule({ id: 'row-b', lane: 'render', key: 'row:b', run() {} });
  scheduler.schedule({ id: 'row-a-2', lane: 'render', key: 'row:a', run() {} });
  assert.strictEqual(scheduler.getPendingCount('render'), 2);
  assert.strictEqual(scheduler.history().at(-1).reason, 'replaced');
  assert.throws(
    () => scheduler.schedule({ id: 'row-c', lane: 'render', key: 'row:c', run() {} }),
    FrontierSchedulerDroppedError
  );
}

{
  const scheduler = createScheduler({
    lanes: [{ id: 'render', maxQueued: 2, backpressure: 'coalesce-key' }]
  });
  const first = scheduler.schedule({ id: 'row-a-1', lane: 'render', key: 'row:a', run() {} });
  const second = scheduler.schedule({ id: 'row-a-2', lane: 'render', key: 'row:a', run() {} });
  assert.strictEqual(second.id, first.id);
  assert.strictEqual(scheduler.getPendingCount('render'), 1);
  assert.strictEqual(scheduler.history().at(-1).reason, 'coalesced');
}

{
  const scheduler = createScheduler({
    lanes: [{ id: 'network', maxQueued: 1, backpressure: 'throw' }]
  });
  scheduler.schedule({ id: 'a', lane: 'network', run() {} });
  assert.throws(
    () => scheduler.schedule({ id: 'b', lane: 'network', run() {} }),
    FrontierSchedulerBackpressureError
  );
  assert.strictEqual(scheduler.cancel('a', 'test-cancel'), true);
  assert.strictEqual(scheduler.getPendingCount(), 0);
  assert.strictEqual(scheduler.history().at(-1).status, 'cancelled');
}

{
  const ran = [];
  const scheduler = createScheduler({
    lanes: [{ id: 'action', priority: 2 }],
    handlers: {
      'todo.toggle': (ctx) => ran.push(ctx.input.id)
    }
  });
  scheduler.schedule({ id: 'toggle-b', type: 'todo.toggle', lane: 'action', input: { id: 'b' }, priority: 'normal', key: 'todo:b' });
  scheduler.schedule({ id: 'toggle-a', type: 'todo.toggle', lane: 'action', input: { id: 'a' }, priority: 'high', key: 'todo:a' });
  const snapshot = scheduler.serialize({ includeHistory: true });
  const restored = deserializeSchedulerState(snapshot, {
    handlers: {
      'todo.toggle': (ctx) => ran.push('restored:' + ctx.input.id)
    }
  });

  assert.deepStrictEqual(restored.snapshot().pendingByLane, { action: 2 });
  restored.run();
  assert.deepStrictEqual(ran, ['restored:a', 'restored:b']);
  assert.strictEqual(restored.serialize().pending.length, 0);
}

{
  const records = [];
  const scheduler = createScheduler({ onRecord: (record) => records.push(record) });
  scheduler.schedule({
    id: 'parent',
    lane: 'default',
    causeId: 'click:save',
    key: 'save',
    run(ctx) {
      ctx.schedule({ id: 'child', lane: 'default', key: 'save', run() {} });
    }
  });
  scheduler.run();
  scheduler.run();
  const graph = scheduler.inspect();
  assert.strictEqual(records.length, 2);
  assert.ok(graph.nodes.some((node) => node.id === 'record:rec-1'));
  assert.ok(graph.edges.some((edge) => edge.kind === 'parent-of' && edge.to === 'record:rec-2'));
  assert.ok(graph.edges.some((edge) => edge.kind === 'same-key'));
}

{
  const recordCallbacks = [];
  const errors = [];
  const scheduler = createScheduler({
    onRecord(record) {
      record.metadata = { touched: true };
      record.dependsOn.push('callback-mutation');
      recordCallbacks.push(record);
    },
    onError(error, record) {
      record.metadata = { touched: true };
      record.dependsOn.push('error-mutation');
      errors.push({ error, record });
    }
  });
  const input = { nested: { count: 1 } };
  scheduler.schedule({
    id: 'ok',
    input,
    metadata: { source: 'test' },
    run(ctx) {
      assert.deepStrictEqual(ctx.input, { nested: { count: 1 } });
    }
  });
  input.nested.count = 2;
  scheduler.schedule({
    id: 'fail',
    metadata: { source: 'test' },
    run() {
      throw new Error('expected');
    }
  });
  scheduler.run();

  assert.strictEqual(recordCallbacks.length, 2);
  assert.strictEqual(errors.length, 1);
  const history = scheduler.history();
  assert.strictEqual(history[0].metadata.source, 'test');
  assert.deepStrictEqual(history[0].dependsOn, []);
  assert.strictEqual(history[1].metadata.source, 'test');
  assert.deepStrictEqual(history[1].dependsOn, []);
}

{
  const scheduler = createScheduler({ framePolicy: 'microtask', autoRun: true });
  let ran = false;
  scheduler.schedule({ id: 'auto', run() { ran = true; } });
  assert.strictEqual(ran, false);
  await Promise.resolve();
  assert.strictEqual(ran, true);
  assert.strictEqual(scheduler.getPendingCount(), 0);
}

{
  let now = 0;
  const scheduler = createScheduler({
    clock: () => now,
    lanes: [
      { id: 'healthy', maxQueued: 8 },
      { id: 'congested', maxQueued: 2 }
    ]
  });
  scheduler.schedule({ id: 'healthy-a', lane: 'healthy', run() { now += 5; } });
  scheduler.schedule({ id: 'healthy-b', lane: 'healthy', run() { now += 7; } });
  scheduler.schedule({ id: 'queued-a', lane: 'congested', run() {} });
  scheduler.schedule({ id: 'queued-b', lane: 'congested', run() {} });

  const result = scheduler.run({ lane: 'healthy' });
  assert.strictEqual(result.completed, 2);
  assert.strictEqual(result.pending, 2);

  const metrics = scheduler.metrics({ activeByLane: { congested: 1 } });
  assert.strictEqual(metrics.byLane.healthy.completed, 2);
  assert.strictEqual(metrics.byLane.healthy.failed, 0);
  assert.strictEqual(metrics.byLane.healthy.queued, 0);
  assert.strictEqual(metrics.byLane.healthy.totalRuntimeMs, 12);
  assert.strictEqual(metrics.byLane.healthy.pressure, 0);
  assert.strictEqual(metrics.byLane.congested.active, 1);
  assert.strictEqual(metrics.byLane.congested.queued, 2);
  assert.strictEqual(metrics.byLane.congested.pressure, 1);
  assert.strictEqual(metrics.totals.completed, 2);
  assert.strictEqual(metrics.totals.queued, 2);

  const structural = summarizeSchedulerThroughput([
    { lane: 'healthy', status: 'completed', durationMs: 12, units: 2 },
    { lane: 'congested', status: 'running', startedAt: 10, units: 1 },
    { lane: 'congested', status: 'queued', units: 1 },
    { lane: 'congested', status: 'failed', durationMs: 3, units: 1 }
  ], {
    now: 25,
    lanes: [
      { id: 'healthy', maxQueued: 8 },
      { id: 'congested', maxQueued: 2 }
    ]
  });
  assert.strictEqual(structural.byLane.healthy.completed, 1);
  assert.strictEqual(structural.byLane.healthy.totalRuntimeMs, 12);
  assert.strictEqual(structural.byLane.congested.active, 1);
  assert.strictEqual(structural.byLane.congested.failed, 1);
  assert.strictEqual(structural.byLane.congested.totalRuntimeMs, 18);
  assert.strictEqual(structural.byLane.congested.pressure, 0.5);
}

console.log('frontier scheduler smoke passed');
