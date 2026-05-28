import {
  createScheduler,
  deserializeSchedulerState,
  type FrontierScheduler,
  type FrontierSchedulerGraph,
  type FrontierSchedulerSerializedState,
  type FrontierSchedulerTaskContext
} from '../src/index.js';

const scheduler: FrontierScheduler = createScheduler({
  lanes: [{ id: 'action', priority: 'critical', maxQueued: 128, backpressure: 'replace-key' }],
  handlers: {
    typed(ctx: FrontierSchedulerTaskContext<{ id: string }>) {
      ctx.schedule({ id: 'child', run() {} });
    }
  }
});

scheduler.schedule({
  type: 'typed',
  lane: 'action',
  key: 'item:a',
  input: { id: 'a' },
  metadata: { source: 'types' }
});

const snapshot: FrontierSchedulerSerializedState = scheduler.serialize({ includeHistory: true });
const restored: FrontierScheduler = deserializeSchedulerState(snapshot, {
  handlers: { typed() {} }
});
const graph: FrontierSchedulerGraph = restored.inspect();

void graph;
