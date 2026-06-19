import assert from 'node:assert';
import {
  FrontierSchedulerBackpressureError,
  FrontierSchedulerDroppedError,
  createContinuousWorkerPoolRefillPlan,
  createScheduler,
  deserializeSchedulerState,
  adjustContinuousWorkerPoolTarget,
  summarizeCoordinatorGateRunCapacity,
  summarizeContinuousWorkerPoolCapacity,
  summarizeContinuousWorkerPoolCapacityState,
  summarizeContinuousWorkerPoolTargetFeedback,
  summarizeApplyLeaderConcurrencyCaps,
  summarizeLocalQueueConcurrencyCaps,
  summarizeLeaseAwarePoolCapacity,
  summarizeModelAwarePoolCapacity,
  summarizeModelAwarePoolSlotAllocation,
  recommendContinuousWorkerPoolTarget,
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
  const full = summarizeContinuousWorkerPoolCapacity({
    desiredConcurrency: 4,
    activeCount: 4,
    queuedCount: 0,
    leaseCount: 0
  });
  assert.strictEqual(full.occupiedCount, 4);
  assert.strictEqual(full.availableCount, 0);
  assert.strictEqual(full.nextRefillCount, 0);
  assert.strictEqual(full.backpressureReason, 'none');
  assert.strictEqual(full.isIdle, false);
  assert.strictEqual(full.isWaste, false);
}

{
  const underfilled = summarizeContinuousWorkerPoolCapacity({
    desiredConcurrency: 4,
    activeCount: 2,
    queuedCount: 6,
    leaseCount: 1
  });
  assert.strictEqual(underfilled.occupiedCount, 3);
  assert.strictEqual(underfilled.availableCount, 1);
  assert.strictEqual(underfilled.nextRefillCount, 1);
  assert.strictEqual(underfilled.backpressureReason, 'refill-needed');
  assert.strictEqual(underfilled.idleCount, 0);
  assert.strictEqual(underfilled.isWaste, false);
}

{
  const reserved = summarizeContinuousWorkerPoolCapacity({
    desiredConcurrency: 10,
    activeCount: 4,
    queuedCount: 8,
    leaseCount: 1,
    reservedCount: 4
  });
  assert.strictEqual(reserved.occupiedCount, 5);
  assert.strictEqual(reserved.availableCount, 5);
  assert.strictEqual(reserved.launchableCount, 1);
  assert.strictEqual(reserved.nextRefillCount, 1);
  assert.strictEqual(reserved.backpressureReason, 'refill-needed');
  assert.strictEqual(reserved.isIdle, false);
}

{
  const backpressured = summarizeContinuousWorkerPoolCapacity({
    desiredConcurrency: 4,
    activeCount: 4,
    queuedCount: 6,
    leaseCount: 2
  });
  assert.strictEqual(backpressured.occupiedCount, 6);
  assert.strictEqual(backpressured.availableCount, 0);
  assert.strictEqual(backpressured.nextRefillCount, 0);
  assert.strictEqual(backpressured.backpressureReason, 'oversubscribed');
  assert.strictEqual(backpressured.wasteCount, 2);
  assert.strictEqual(backpressured.isIdle, false);
  assert.strictEqual(backpressured.isWaste, true);
}

{
  const capacity = summarizeLocalQueueConcurrencyCaps({
    scopes: [
      { id: 'scope:a', activeCount: 1, queuedCount: 3 },
      { id: 'scope:b', activeCount: 0, queuedCount: 2 },
      { id: 'scope:c', activeCount: 2, queuedCount: 1 },
      { id: 'scope:d', activeCount: 0, queuedCount: 0 }
    ]
  });
  assert.strictEqual(summarizeApplyLeaderConcurrencyCaps, summarizeLocalQueueConcurrencyCaps);
  assert.strictEqual(capacity.scopeCount, 4);
  assert.strictEqual(capacity.activeScopeCount, 2);
  assert.strictEqual(capacity.queuedScopeCount, 3);
  assert.strictEqual(capacity.activeLeaderCount, 3);
  assert.strictEqual(capacity.queuedCount, 6);
  assert.strictEqual(capacity.launchableCount, 1);
  assert.strictEqual(capacity.blockedCount, 5);
  assert.strictEqual(capacity.leaderBlockedScopeCount, 2);
  assert.strictEqual(capacity.oversubscribedScopeCount, 1);
  assert.strictEqual(capacity.backpressureReason, 'oversubscribed');
  assert.strictEqual(capacity.isBackpressured, true);
  assert.strictEqual(capacity.byScope['scope:a'].leaderCapacity, 1);
  assert.strictEqual(capacity.byScope['scope:b'].launchableCount, 1);
  assert.strictEqual(capacity.byScope['scope:b'].blockedCount, 1);
  assert.strictEqual(capacity.byScope['scope:c'].isOversubscribed, true);
}

{
  const state = summarizeContinuousWorkerPoolCapacityState({
    desiredConcurrency: 8,
    activeCount: 2,
    queuedCount: 1,
    reviewDrainCount: 2,
    rerunCount: 1,
    conflictCount: 1,
    humanQuestionCount: 1
  });
  assert.strictEqual(state.kind, 'frontier.scheduler.continuous-pool-capacity-state');
  assert.strictEqual(state.desiredConcurrency, 8);
  assert.strictEqual(state.occupiedCount, 8);
  assert.strictEqual(state.drainedCount, 0);
  assert.strictEqual(state.overflowCount, 0);
  assert.strictEqual(state.stateCounts.active, 2);
  assert.strictEqual(state.stateCounts.queued, 1);
  assert.strictEqual(state.stateCounts['review-drain'], 2);
  assert.strictEqual(state.stateCounts.rerun, 1);
  assert.strictEqual(state.stateCounts.conflict, 1);
  assert.strictEqual(state.stateCounts['human-question'], 1);
  assert.strictEqual(state.stateCounts.drained, 0);
  assert.strictEqual(state.isBlocked, true);
  assert.strictEqual(state.isDrained, false);
}

{
  const drained = summarizeContinuousWorkerPoolCapacityState({
    desiredConcurrency: 5
  });
  assert.strictEqual(drained.occupiedCount, 0);
  assert.strictEqual(drained.drainedCount, 5);
  assert.strictEqual(drained.stateCounts.drained, 5);
  assert.strictEqual(drained.isBlocked, false);
  assert.strictEqual(drained.isDrained, true);
}

{
  const refill = createContinuousWorkerPoolRefillPlan({
    maxWorkers: 5,
    activeCount: 1,
    generatedAt: 42,
    drainQueues: [
      {
        id: 'review-drain',
        priority: 'high',
        items: [
          { id: 'review-low', priority: 'low' },
          { id: 'review-high', priority: 'critical' }
        ]
      },
      {
        id: 'rerun',
        priority: 'normal',
        items: [
          { id: 'rerun-one', priority: 1 }
        ]
      }
    ],
    implementationBacklog: [
      { id: 'impl-first', priority: 'critical' },
      { id: 'impl-second', priority: 'high' }
    ]
  });

  assert.strictEqual(refill.kind, 'frontier.scheduler.continuous-refill-plan');
  assert.strictEqual(refill.idleSlotCount, 4);
  assert.strictEqual(refill.drainQueueCount, 2);
  assert.strictEqual(refill.drainItemCount, 3);
  assert.strictEqual(refill.implementationBacklogCount, 2);
  assert.strictEqual(refill.filledSlotCount, 4);
  assert.strictEqual(refill.drainFilledCount, 3);
  assert.strictEqual(refill.implementationFilledCount, 1);
  assert.deepStrictEqual(refill.recommendations.map((entry) => entry.itemId), [
    'review-high',
    'review-low',
    'rerun-one',
    'impl-first'
  ]);
  assert.deepStrictEqual(refill.recommendations.map((entry) => entry.bucket), [
    'drain',
    'drain',
    'drain',
    'implementation'
  ]);
  assert.deepStrictEqual(refill.recommendations.map((entry) => entry.queueId), [
    'review-drain',
    'review-drain',
    'rerun',
    undefined
  ]);
  assert.deepStrictEqual(refill.recommendations[0].reasons, ['local-drain-before-implementation-backlog']);
  assert.deepStrictEqual(refill.recommendations[3].reasons, ['implementation-backlog-after-local-drain']);
  assert.strictEqual(refill.slots[3].state, 'fillable');
  assert.strictEqual(refill.slots.length, 4);
}

{
  const neutral = summarizeContinuousWorkerPoolTargetFeedback({});
  assert.strictEqual(neutral.minTarget, 5);
  assert.strictEqual(neutral.maxTarget, 10);
  assert.strictEqual(neutral.targetConcurrency, 8);
  assert.strictEqual(neutral.usefulOutputScore, 0);
  assert.strictEqual(neutral.cpuPressureScore, 0);
  assert.strictEqual(neutral.reviewDebtScore, 0);
  assert.strictEqual(recommendContinuousWorkerPoolTarget({}), 8);
}

{
  const boosted = summarizeContinuousWorkerPoolTargetFeedback({
    usefulOutputCount: 16,
    cpuPressure: 0,
    reviewDebt: 0
  });
  assert.strictEqual(boosted.targetConcurrency, 10);
  assert.strictEqual(adjustContinuousWorkerPoolTarget({
    usefulOutputCount: 16,
    cpuPressure: 0,
    reviewDebt: 0
  }), 10);
}

{
  const constrained = summarizeContinuousWorkerPoolTargetFeedback({
    usefulOutputCount: 0,
    cpuPressure: 1,
    reviewDebt: 16,
    minTarget: 6,
    maxTarget: 9
  });
  assert.strictEqual(constrained.targetConcurrency, 6);
  assert.strictEqual(recommendContinuousWorkerPoolTarget({
    usefulOutputCount: 0,
    cpuPressure: 1,
    reviewDebt: 16,
    minTarget: 6,
    maxTarget: 9
  }), 6);
}

{
  const capacity = summarizeLeaseAwarePoolCapacity({
    targetConcurrency: 4,
    now: 100,
    leases: [
      { expiresAt: 150 },
      { expiresAt: 120 },
      { expiresAt: 80 }
    ]
  });
  assert.strictEqual(capacity.activeCount, 2);
  assert.strictEqual(capacity.staleLeaseCount, 1);
  assert.strictEqual(capacity.availableCount, 2);
  assert.strictEqual(capacity.reviewDrainPressure, 0);
  assert.strictEqual(capacity.reservedCount, 1);
  assert.strictEqual(capacity.launchableCount, 1);
  assert.strictEqual(capacity.suggestedRefillCount, 0);
  assert.strictEqual(capacity.isIdle, false);
}

{
  const capacity = summarizeLeaseAwarePoolCapacity({
    targetConcurrency: 4,
    now: 100,
    heartbeatGraceMs: 25,
    leases: [
      { expiresAt: 115 },
      { expiresAt: 105 },
      { expiresAt: 70 }
    ]
  });
  assert.strictEqual(capacity.activeCount, 2);
  assert.strictEqual(capacity.staleLeaseCount, 1);
  assert.strictEqual(capacity.availableCount, 2);
  assert.strictEqual(capacity.reviewDrainPressure, 0);
  assert.strictEqual(capacity.reservedCount, 1);
  assert.strictEqual(capacity.launchableCount, 1);
  assert.strictEqual(capacity.suggestedRefillCount, 0);
  assert.strictEqual(capacity.isIdle, false);
}

{
  const capped = summarizeLeaseAwarePoolCapacity({
    targetConcurrency: 3,
    activeCount: 1,
    queuedCount: 0,
    reviewCount: 2,
    repairCount: 0,
    rerunCount: 0,
    applyCount: 0,
    blockedHumanCount: 3,
    staleLeaseCount: 0
  });
  assert.strictEqual(capped.availableCount, 2);
  assert.strictEqual(capped.reviewDrainPressure, 2);
  assert.strictEqual(capped.reservedCount, 2);
  assert.strictEqual(capped.launchableCount, 0);
  assert.strictEqual(capped.suggestedRefillCount, 0);
  assert.strictEqual(capped.queuedCount, 0);
  assert.strictEqual(capped.blockedHumanCount, 3);
}

{
  const mixed = summarizeLeaseAwarePoolCapacity({
    targetConcurrency: 10,
    activeCount: 4,
    queuedCount: 8,
    reviewCount: 0,
    repairCount: 2,
    rerunCount: 1,
    applyCount: 1,
    blockedHumanCount: 1,
    staleLeaseCount: 1
  });
  assert.strictEqual(mixed.activeCount, 4);
  assert.strictEqual(mixed.reviewCount, 0);
  assert.strictEqual(mixed.repairCount, 2);
  assert.strictEqual(mixed.rerunCount, 1);
  assert.strictEqual(mixed.applyCount, 1);
  assert.strictEqual(mixed.reviewDrainPressure, 4);
  assert.strictEqual(mixed.reservedCount, 5);
  assert.strictEqual(mixed.availableCount, 6);
  assert.strictEqual(mixed.launchableCount, 1);
  assert.strictEqual(mixed.suggestedRefillCount, 1);
  assert.strictEqual(mixed.isIdle, false);
  assert.strictEqual(mixed.blockedHumanCount, 1);
}

{
  const capacity = summarizeCoordinatorGateRunCapacity({
    targetConcurrency: 10,
    activeCount: 4,
    gateRunCount: 2,
    applyCount: 1,
    repairCount: 1,
    rerunCount: 1,
    speculativeBacklogCount: 6,
    blockedHumanCount: 2,
    staleLeaseCount: 1
  });
  assert.strictEqual(capacity.activeCount, 4);
  assert.strictEqual(capacity.gateRunCount, 2);
  assert.strictEqual(capacity.applyCount, 1);
  assert.strictEqual(capacity.repairCount, 1);
  assert.strictEqual(capacity.rerunCount, 1);
  assert.strictEqual(capacity.speculativeBacklogCount, 6);
  assert.strictEqual(capacity.blockedHumanCount, 2);
  assert.strictEqual(capacity.staleLeaseCount, 1);
  assert.strictEqual(capacity.gateDrainPressure, 5);
  assert.strictEqual(capacity.reservedCount, 6);
  assert.strictEqual(capacity.availableCount, 6);
  assert.strictEqual(capacity.launchableCount, 0);
  assert.strictEqual(capacity.suggestedRefillCount, 0);
  assert.strictEqual(capacity.isIdle, false);
}

{
  const capacity = summarizeCoordinatorGateRunCapacity({
    targetConcurrency: 10,
    activeCount: 4,
    gateRunCount: 1,
    applyCount: 1,
    repairCount: 0,
    rerunCount: 0,
    speculativeBacklogCount: 7,
    blockedHumanCount: 3,
    staleLeaseCount: 0
  });
  assert.strictEqual(capacity.blockedHumanCount, 3);
  assert.strictEqual(capacity.gateDrainPressure, 2);
  assert.strictEqual(capacity.reservedCount, 2);
  assert.strictEqual(capacity.availableCount, 6);
  assert.strictEqual(capacity.launchableCount, 4);
  assert.strictEqual(capacity.suggestedRefillCount, 4);
}

{
  const capacity = summarizeCoordinatorGateRunCapacity({
    targetConcurrency: 8,
    activeCount: 5,
    gateRunCount: 2,
    applyCount: 1,
    repairCount: 0,
    rerunCount: 0,
    speculativeBacklogCount: 6,
    blockedHumanCount: 0,
    staleLeaseCount: 0
  });
  assert.strictEqual(capacity.gateDrainPressure, 3);
  assert.strictEqual(capacity.reservedCount, 3);
  assert.strictEqual(capacity.availableCount, 3);
  assert.strictEqual(capacity.launchableCount, 0);
  assert.strictEqual(capacity.suggestedRefillCount, 0);
}

{
  const capacity = summarizeModelAwarePoolCapacity({
    budgetRemaining: 12,
    escalationBudgetRemaining: 4,
    expensiveTierId: 'deep',
    tiers: [
      { id: 'fast', desiredConcurrency: 4, activeCount: 2, leaseCount: 1, queuedCount: 3 },
      { id: 'standard', desiredConcurrency: 3, activeCount: 3, queuedCount: 1 },
      { id: 'deep', desiredConcurrency: 2, activeCount: 2, queuedCount: 2 }
    ]
  });
  assert.deepStrictEqual(capacity.openSlotsByTier, { fast: 1, standard: 0, deep: 0 });
  assert.strictEqual(capacity.byTier.fast.openSlots, 1);
  assert.strictEqual(capacity.byTier.standard.openSlots, 0);
  assert.strictEqual(capacity.byTier.deep.openSlots, 0);
  assert.strictEqual(capacity.totalOpenSlots, 1);
  assert.strictEqual(capacity.expensiveTierOpenSlots, 0);
  assert.strictEqual(capacity.expensiveTierSaturation, 2);
  assert.strictEqual(capacity.backpressureReason, 'expensive-tier-saturated');
  assert.strictEqual(capacity.downgradeAdvice, 'downgrade');
  assert.strictEqual(capacity.isBackpressured, true);
}

{
  const budgeted = summarizeModelAwarePoolCapacity({
    budgetRemaining: 0,
    escalationBudgetRemaining: 3,
    tiers: [
      { id: 'fast', desiredConcurrency: 1, activeCount: 1, queuedCount: 2 },
      { id: 'standard', desiredConcurrency: 1, activeCount: 1, queuedCount: 0 },
      { id: 'deep', desiredConcurrency: 1, activeCount: 1, queuedCount: 0 }
    ]
  });
  assert.strictEqual(budgeted.backpressureReason, 'budget-exhausted');
  assert.strictEqual(budgeted.downgradeAdvice, 'backpressure');
  assert.strictEqual(budgeted.budgetExhausted, true);
  assert.strictEqual(budgeted.escalationBudgetExhausted, false);
}

{
  const allocation = summarizeModelAwarePoolSlotAllocation({
    requestedSlots: 4,
    budgetRemaining: 12,
    escalationBudgetRemaining: 4,
    expensiveTierId: 'deep',
    tiers: [
      { id: 'fast', desiredConcurrency: 2, activeCount: 1 },
      { id: 'standard', desiredConcurrency: 3, activeCount: 1 },
      { id: 'deep', desiredConcurrency: 4, activeCount: 2 }
    ]
  });
  assert.deepStrictEqual(allocation.allocationByTier, { fast: 1, standard: 2, deep: 1 });
  assert.strictEqual(allocation.allocatedSlots, 4);
  assert.strictEqual(allocation.deferredSlots, 0);
  assert.strictEqual(allocation.expensiveTierAllocatedSlots, 1);
  assert.strictEqual(allocation.backpressureReason, 'none');
}

{
  const allocation = summarizeModelAwarePoolSlotAllocation({
    requestedSlots: 3,
    budgetRemaining: 0,
    escalationBudgetRemaining: 2,
    expensiveTierId: 'deep',
    tiers: [
      { id: 'fast', desiredConcurrency: 2, activeCount: 1 },
      { id: 'standard', desiredConcurrency: 2, activeCount: 0 },
      { id: 'deep', desiredConcurrency: 3, activeCount: 0 }
    ]
  });
  assert.deepStrictEqual(allocation.allocationByTier, { fast: 1, standard: 2, deep: 0 });
  assert.strictEqual(allocation.allocatedSlots, 3);
  assert.strictEqual(allocation.deferredSlots, 0);
  assert.strictEqual(allocation.expensiveTierAllocatedSlots, 0);
  assert.strictEqual(allocation.backpressureReason, 'budget-exhausted');
  assert.strictEqual(allocation.downgradeAdvice, 'backpressure');
}

{
  const allocation = summarizeModelAwarePoolSlotAllocation({
    requestedSlots: 2,
    budgetRemaining: 8,
    escalationBudgetRemaining: 2,
    expensiveTierId: 'deep',
    tiers: [
      { id: 'fast', desiredConcurrency: 2, activeCount: 0 },
      { id: 'standard', desiredConcurrency: 2, activeCount: 0 }
    ]
  });
  assert.deepStrictEqual(allocation.allocationByTier, { fast: 2, standard: 0, deep: 0 });
  assert.strictEqual(allocation.expensiveTierAllocatedSlots, 0);
  assert.strictEqual(allocation.tiers.at(-1).id, 'deep');
  assert.deepStrictEqual(allocation.byTier.deep, {
    id: 'deep',
    openSlots: 0,
    allocatedSlots: 0,
    deferredSlots: 0,
    isExpensiveTier: true
  });
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
