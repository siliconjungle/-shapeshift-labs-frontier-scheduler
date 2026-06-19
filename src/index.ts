export type FrontierSchedulerPriority = 'critical' | 'high' | 'normal' | 'low' | 'idle' | number;
export type FrontierSchedulerBackpressurePolicy =
  | 'queue'
  | 'drop-new'
  | 'drop-old'
  | 'cancel-old'
  | 'replace-key'
  | 'coalesce-key'
  | 'throw';
export type FrontierSchedulerFramePolicy = 'manual' | 'microtask' | 'animationFrame' | 'idle' | 'timeout';
export type FrontierScheduledTaskStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled' | 'dropped';
export type FrontierSchedulerRecordStatus = FrontierScheduledTaskStatus;

export interface FrontierSchedulerLaneOptions {
  id: string;
  priority?: FrontierSchedulerPriority;
  maxQueued?: number | null;
  maxUnitsPerRun?: number | null;
  maxMsPerRun?: number | null;
  backpressure?: FrontierSchedulerBackpressurePolicy;
}

export interface FrontierSchedulerBudgetOptions {
  startMs?: number;
  maxMs?: number | null;
  maxUnits?: number | null;
  maxTasks?: number | null;
}

export interface FrontierSchedulerTask<TInput = unknown> {
  id?: string;
  type?: string;
  input?: TInput;
  lane?: string;
  area?: string;
  priority?: FrontierSchedulerPriority;
  units?: number;
  key?: string;
  causeId?: string;
  parentId?: string;
  dependsOn?: readonly string[];
  metadata?: Record<string, unknown>;
  run?: (context: FrontierSchedulerTaskContext<TInput>) => unknown;
}

export interface FrontierSchedulerTaskContext<TInput = unknown> {
  scheduler: FrontierScheduler;
  task: FrontierScheduledTask<TInput>;
  input: TInput | undefined;
  metadata: Record<string, unknown>;
  shouldYield(units?: number): boolean;
  schedule<TNextInput = unknown>(task: FrontierSchedulerTask<TNextInput>): FrontierScheduledTask<TNextInput>;
  cancel(taskId: string, reason?: string): boolean;
}

export type FrontierSchedulerHandler<TInput = any> = (context: FrontierSchedulerTaskContext<TInput>) => unknown;

export interface FrontierSchedulerOptions extends FrontierSchedulerBudgetOptions {
  lanes?: readonly (string | FrontierSchedulerLaneOptions)[];
  defaultLane?: string;
  defaultBackpressure?: FrontierSchedulerBackpressurePolicy;
  framePolicy?: FrontierSchedulerFramePolicy;
  frameDelayMs?: number;
  autoRun?: boolean;
  clock?: () => number;
  handlers?: Record<string, FrontierSchedulerHandler<any>>;
  maxHistory?: number;
  onRecord?: (record: FrontierSchedulerRecord) => void;
  onError?: (error: unknown, record: FrontierSchedulerRecord) => void;
}

export interface FrontierSchedulerRunOptions extends FrontierSchedulerBudgetOptions {
  lane?: string;
}

export interface FrontierSchedulerFrameOptions extends FrontierSchedulerRunOptions {
  policy?: FrontierSchedulerFramePolicy;
  delayMs?: number;
}

export interface FrontierScheduledTask<TInput = unknown> {
  readonly id: string;
  readonly type?: string;
  readonly input?: TInput;
  readonly lane: string;
  readonly area: string;
  readonly priority: number;
  readonly units: number;
  readonly key?: string;
  readonly causeId?: string;
  readonly parentId?: string;
  readonly dependsOn: string[];
  readonly metadata?: Record<string, unknown>;
  readonly queuedAt: number;
  readonly sequence: number;
  readonly status: FrontierScheduledTaskStatus;
  cancel(reason?: string): boolean;
}

export interface FrontierSchedulerRecord {
  id: string;
  taskId: string;
  type?: string;
  lane: string;
  area: string;
  key?: string;
  causeId?: string;
  parentId?: string;
  dependsOn: string[];
  status: FrontierSchedulerRecordStatus;
  queuedAt: number;
  startedAt?: number;
  endedAt: number;
  durationMs: number;
  units: number;
  priority: number;
  sequence: number;
  metadata?: Record<string, unknown>;
  reason?: string;
  error?: string;
}

export interface FrontierSchedulerRunResult {
  completed: number;
  failed: number;
  cancelled: number;
  dropped: number;
  pending: number;
  blocked: number;
  usedUnits: number;
  elapsedMs: number;
  budgetExhausted: boolean;
  taskLimitReached: boolean;
  pendingByLane: Record<string, number>;
}

export interface FrontierSchedulerSnapshot {
  pending: number;
  pendingByLane: Record<string, number>;
  lanes: FrontierSchedulerLaneSnapshot[];
}

export interface FrontierSchedulerLaneSnapshot {
  id: string;
  priority: number;
  queued: number;
  maxQueued: number;
  backpressure: FrontierSchedulerBackpressurePolicy;
}

export interface FrontierSchedulerThroughputRecord {
  lane?: string;
  status?: FrontierScheduledTaskStatus;
  queuedAt?: number;
  startedAt?: number;
  endedAt?: number;
  durationMs?: number;
  units?: number;
}

export interface FrontierSchedulerThroughputLaneOptions {
  id: string;
  maxQueued?: number | null;
}

export interface FrontierSchedulerThroughputOptions {
  lanes?: readonly (string | FrontierSchedulerLaneSnapshot | FrontierSchedulerThroughputLaneOptions)[];
  queuedByLane?: Record<string, number>;
  activeByLane?: Record<string, number>;
  now?: number;
}

export interface FrontierSchedulerLaneThroughputMetrics {
  id: string;
  active: number;
  queued: number;
  completed: number;
  failed: number;
  cancelled: number;
  dropped: number;
  total: number;
  totalRuntimeMs: number;
  completedRuntimeMs: number;
  failedRuntimeMs: number;
  totalUnits: number;
  maxQueued: number;
  pressure: number;
}

export interface FrontierSchedulerThroughputMetrics {
  kind: 'frontier.scheduler.throughput';
  version: 1;
  lanes: FrontierSchedulerLaneThroughputMetrics[];
  byLane: Record<string, FrontierSchedulerLaneThroughputMetrics>;
  totals: FrontierSchedulerLaneThroughputMetrics;
}

export type ContinuousWorkerPoolBackpressureReason =
  | 'none'
  | 'refill-needed'
  | 'at-capacity'
  | 'oversubscribed';

export interface ContinuousWorkerPoolCapacityInput {
  desiredConcurrency: number;
  activeCount?: number | null;
  queuedCount?: number | null;
  leaseCount?: number | null;
  reservedCount?: number | null;
}

export interface ContinuousWorkerPoolCapacitySummary {
  desiredConcurrency: number;
  activeCount: number;
  queuedCount: number;
  leaseCount: number;
  reservedCount: number;
  occupiedCount: number;
  availableCount: number;
  launchableCount: number;
  nextRefillCount: number;
  idleCount: number;
  wasteCount: number;
  backpressureReason: ContinuousWorkerPoolBackpressureReason;
  isIdle: boolean;
  isWaste: boolean;
}

export type ContinuousWorkerPoolCapacityState =
  | 'active'
  | 'queued'
  | 'review-drain'
  | 'rerun'
  | 'conflict'
  | 'human-question'
  | 'drained';

export interface ContinuousWorkerPoolCapacityStateInput {
  desiredConcurrency: number;
  activeCount?: number | null;
  queuedCount?: number | null;
  reviewDrainCount?: number | null;
  rerunCount?: number | null;
  conflictCount?: number | null;
  humanQuestionCount?: number | null;
}

export interface ContinuousWorkerPoolCapacityStateSummary {
  kind: 'frontier.scheduler.continuous-pool-capacity-state';
  version: 1;
  desiredConcurrency: number;
  activeCount: number;
  queuedCount: number;
  reviewDrainCount: number;
  rerunCount: number;
  conflictCount: number;
  humanQuestionCount: number;
  drainedCount: number;
  overflowCount: number;
  occupiedCount: number;
  stateCounts: Record<ContinuousWorkerPoolCapacityState, number>;
  isBlocked: boolean;
  isDrained: boolean;
}

export type ContinuousWorkerPoolRefillBucket = 'drain' | 'implementation';

export interface ContinuousWorkerPoolRefillItem {
  id: string;
  priority?: FrontierSchedulerPriority;
  reasons?: readonly string[];
}

export interface ContinuousWorkerPoolRefillQueue {
  id: string;
  priority?: FrontierSchedulerPriority;
  items: readonly ContinuousWorkerPoolRefillItem[];
}

export interface ContinuousWorkerPoolRefillPlanInput {
  maxWorkers?: number | null;
  activeCount?: number | null;
  drainQueues?: readonly ContinuousWorkerPoolRefillQueue[];
  implementationBacklog?: readonly ContinuousWorkerPoolRefillItem[];
  generatedAt?: number;
}

export interface ContinuousWorkerPoolRefillSlot {
  id: string;
  index: number;
  state: 'idle' | 'fillable';
  recommendationId?: string;
}

export interface ContinuousWorkerPoolRefillRecommendation {
  id: string;
  slotId: string;
  slotIndex: number;
  queueId?: string;
  itemId: string;
  bucket: ContinuousWorkerPoolRefillBucket;
  priority: number;
  reasons: string[];
}

export interface ContinuousWorkerPoolRefillPlan {
  kind: 'frontier.scheduler.continuous-refill-plan';
  version: 1;
  id: string;
  generatedAt: number;
  maxWorkers: number;
  activeCount: number;
  idleSlotCount: number;
  drainQueueCount: number;
  drainItemCount: number;
  implementationBacklogCount: number;
  filledSlotCount: number;
  drainFilledCount: number;
  implementationFilledCount: number;
  slots: ContinuousWorkerPoolRefillSlot[];
  recommendations: ContinuousWorkerPoolRefillRecommendation[];
}

export interface ContinuousWorkerPoolTargetFeedbackInput {
  usefulOutputCount?: number | null;
  cpuPressure?: number | null;
  reviewDebt?: number | null;
  minTarget?: number | null;
  maxTarget?: number | null;
}

export interface ContinuousWorkerPoolTargetFeedbackSummary {
  minTarget: number;
  maxTarget: number;
  usefulOutputCount: number;
  cpuPressure: number;
  reviewDebt: number;
  usefulOutputScore: number;
  cpuPressureScore: number;
  reviewDebtScore: number;
  targetConcurrency: number;
}

export interface CoordinatorGateRunCapacityInput {
  targetConcurrency: number;
  activeCount?: number | null;
  gateRunCount?: number | null;
  applyCount?: number | null;
  repairCount?: number | null;
  rerunCount?: number | null;
  speculativeBacklogCount?: number | null;
  blockedHumanCount?: number | null;
  staleLeaseCount?: number | null;
  heartbeatGraceMs?: number | null;
  leases?: readonly LeaseAwarePoolLeaseInput[];
  now?: number;
}

export interface CoordinatorGateRunCapacitySummary {
  targetConcurrency: number;
  activeCount: number;
  gateRunCount: number;
  applyCount: number;
  repairCount: number;
  rerunCount: number;
  speculativeBacklogCount: number;
  blockedHumanCount: number;
  staleLeaseCount: number;
  gateDrainPressure: number;
  reservedCount: number;
  availableCount: number;
  launchableCount: number;
  suggestedRefillCount: number;
  isIdle: boolean;
}

export interface LeaseAwarePoolLeaseInput {
  expiresAt?: number | null;
}

export interface LeaseAwarePoolCapacityInput {
  targetConcurrency: number;
  activeCount?: number | null;
  queuedCount?: number | null;
  reviewCount?: number | null;
  repairCount?: number | null;
  rerunCount?: number | null;
  applyCount?: number | null;
  blockedHumanCount?: number | null;
  staleLeaseCount?: number | null;
  heartbeatGraceMs?: number | null;
  leases?: readonly LeaseAwarePoolLeaseInput[];
  now?: number;
}

export interface LeaseAwarePoolCapacitySummary {
  targetConcurrency: number;
  activeCount: number;
  queuedCount: number;
  reviewCount: number;
  repairCount: number;
  rerunCount: number;
  applyCount: number;
  blockedHumanCount: number;
  staleLeaseCount: number;
  reviewDrainPressure: number;
  reservedCount: number;
  availableCount: number;
  launchableCount: number;
  suggestedRefillCount: number;
  isIdle: boolean;
}

export type LocalQueueConcurrencyBackpressureReason = 'none' | 'refill-needed' | 'at-capacity' | 'oversubscribed';

export interface LocalQueueConcurrencyScopeInput {
  id: string;
  activeCount?: number | null;
  queuedCount?: number | null;
}

export interface LocalQueueConcurrencyScopeSummary {
  id: string;
  activeCount: number;
  queuedCount: number;
  leaderCapacity: number;
  launchableCount: number;
  blockedCount: number;
  isActive: boolean;
  isOversubscribed: boolean;
}

export interface LocalQueueConcurrencyCapsInput {
  scopes: readonly LocalQueueConcurrencyScopeInput[];
}

export interface LocalQueueConcurrencyCapsSummary {
  kind: 'frontier.scheduler.local-queue-concurrency-caps';
  version: 1;
  scopeCount: number;
  activeScopeCount: number;
  queuedScopeCount: number;
  activeLeaderCount: number;
  queuedCount: number;
  launchableCount: number;
  blockedCount: number;
  leaderBlockedScopeCount: number;
  oversubscribedScopeCount: number;
  backpressureReason: LocalQueueConcurrencyBackpressureReason;
  isBackpressured: boolean;
  scopes: LocalQueueConcurrencyScopeSummary[];
  byScope: Record<string, LocalQueueConcurrencyScopeSummary>;
}

export type ModelAwarePoolBackpressureReason =
  | 'none'
  | 'refill-needed'
  | 'at-capacity'
  | 'budget-exhausted'
  | 'escalation-budget-exhausted'
  | 'expensive-tier-saturated';

export type ModelAwarePoolDowngradeAdvice = 'none' | 'backpressure' | 'downgrade';

export interface ModelAwarePoolTierCapacityInput extends ContinuousWorkerPoolCapacityInput {
  id: string;
}

export interface ModelAwarePoolCapacityInput {
  tiers: readonly ModelAwarePoolTierCapacityInput[];
  budgetRemaining?: number | null;
  escalationBudgetRemaining?: number | null;
  expensiveTierId?: string;
}

export interface ModelAwarePoolTierCapacitySummary extends ContinuousWorkerPoolCapacitySummary {
  id: string;
  openSlots: number;
  saturation: number;
  isExpensiveTier: boolean;
}

export interface ModelAwarePoolSlotAllocationInput extends ModelAwarePoolCapacityInput {
  requestedSlots?: number | null;
}

export interface ModelAwarePoolSlotAllocationTierSummary {
  id: string;
  openSlots: number;
  allocatedSlots: number;
  deferredSlots: number;
  isExpensiveTier: boolean;
}

export interface ModelAwarePoolSlotAllocationSummary {
  kind: 'frontier.scheduler.model-aware-pool-slot-allocation';
  requestedSlots: number;
  allocatedSlots: number;
  deferredSlots: number;
  allocationByTier: Record<string, number>;
  tiers: ModelAwarePoolSlotAllocationTierSummary[];
  byTier: Record<string, ModelAwarePoolSlotAllocationTierSummary>;
  budgetRemaining: number;
  escalationBudgetRemaining: number;
  budgetExhausted: boolean;
  escalationBudgetExhausted: boolean;
  expensiveTierId: string;
  expensiveTierAllocatedSlots: number;
  backpressureReason: ModelAwarePoolBackpressureReason;
  downgradeAdvice: ModelAwarePoolDowngradeAdvice;
  isBackpressured: boolean;
}

export interface ModelAwarePoolCapacitySummary {
  tiers: ModelAwarePoolTierCapacitySummary[];
  byTier: Record<string, ModelAwarePoolTierCapacitySummary>;
  openSlotsByTier: Record<string, number>;
  totalOpenSlots: number;
  totalQueuedCount: number;
  budgetRemaining: number;
  escalationBudgetRemaining: number;
  budgetExhausted: boolean;
  escalationBudgetExhausted: boolean;
  expensiveTierId: string;
  expensiveTierOpenSlots: number;
  expensiveTierSaturation: number;
  backpressureReason: ModelAwarePoolBackpressureReason;
  downgradeAdvice: ModelAwarePoolDowngradeAdvice;
  isBackpressured: boolean;
}

export interface FrontierSchedulerGraphNode {
  id: string;
  kind: 'lane' | 'task' | 'record';
  label?: string;
  status?: FrontierScheduledTaskStatus;
  metadata?: Record<string, unknown>;
}

export interface FrontierSchedulerGraphEdge {
  from: string;
  to: string;
  kind: 'contains' | 'runs' | 'caused-by' | 'parent-of' | 'depends-on' | 'same-key';
}

export interface FrontierSchedulerGraph {
  nodes: FrontierSchedulerGraphNode[];
  edges: FrontierSchedulerGraphEdge[];
}

export interface FrontierSchedulerSerializedTask {
  id: string;
  type?: string;
  input?: unknown;
  lane: string;
  area: string;
  priority: number;
  units: number;
  key?: string;
  causeId?: string;
  parentId?: string;
  dependsOn: string[];
  metadata?: Record<string, unknown>;
  queuedAt: number;
  sequence: number;
}

export interface FrontierSchedulerSerializedState {
  kind: 'frontier.scheduler.state';
  version: 1;
  lanes: FrontierSchedulerLaneSnapshot[];
  pending: FrontierSchedulerSerializedTask[];
  completedTaskIds: string[];
  records?: FrontierSchedulerRecord[];
}

export interface FrontierSchedulerSerializeOptions {
  includeHistory?: boolean;
}

export interface FrontierScheduler {
  schedule<TInput = unknown>(task: FrontierSchedulerTask<TInput>): FrontierScheduledTask<TInput>;
  run(options?: FrontierSchedulerRunOptions): FrontierSchedulerRunResult;
  requestRun(options?: FrontierSchedulerFrameOptions): FrontierSchedulerSnapshot;
  cancel(taskId: string, reason?: string): boolean;
  cancelLane(laneId: string, reason?: string): number;
  clear(laneId?: string): number;
  getPendingCount(laneId?: string): number;
  snapshot(): FrontierSchedulerSnapshot;
  metrics(options?: FrontierSchedulerThroughputOptions): FrontierSchedulerThroughputMetrics;
  history(): FrontierSchedulerRecord[];
  clearHistory(): void;
  inspect(): FrontierSchedulerGraph;
  serialize(options?: FrontierSchedulerSerializeOptions): FrontierSchedulerSerializedState;
}

interface InternalLane {
  id: string;
  priority: number;
  maxQueued: number;
  maxUnitsPerRun: number;
  maxMsPerRun: number;
  backpressure: FrontierSchedulerBackpressurePolicy;
}

interface InternalTask<TInput = unknown> {
  id: string;
  type?: string;
  input?: TInput;
  lane: string;
  area: string;
  priority: number;
  units: number;
  key?: string;
  causeId?: string;
  parentId?: string;
  dependsOn: string[];
  metadata?: Record<string, unknown>;
  queuedAt: number;
  sequence: number;
  status: FrontierScheduledTaskStatus;
  run?: (context: FrontierSchedulerTaskContext<TInput>) => unknown;
  view: FrontierScheduledTask<TInput>;
}

export function createScheduler(options: FrontierSchedulerOptions = {}): FrontierScheduler {
  return new Scheduler(options);
}

export const createDeterministicScheduler = createScheduler;

export function summarizeSchedulerThroughput(
  records: readonly FrontierSchedulerThroughputRecord[] = [],
  options: FrontierSchedulerThroughputOptions = {}
): FrontierSchedulerThroughputMetrics {
  if (!Array.isArray(records)) throw new TypeError('scheduler throughput records must be an array');
  const lanes = new Map<string, FrontierSchedulerLaneThroughputMetrics>();
  for (const lane of options.lanes ?? []) {
    const input = readThroughputLane(lane);
    ensureThroughputLane(lanes, input.id, input.maxQueued);
  }
  for (const record of records) applyThroughputRecord(lanes, record, options.now);
  applyThroughputCounts(lanes, options.queuedByLane, 'queued', 'queuedByLane');
  applyThroughputCounts(lanes, options.activeByLane, 'active', 'activeByLane');

  const laneMetrics = Array.from(lanes.values());
  for (const lane of laneMetrics) finalizeThroughputLane(lane);
  const totals = createThroughputLane('total', totalMaxQueued(laneMetrics));
  for (const lane of laneMetrics) addThroughputLane(totals, lane);
  finalizeThroughputLane(totals);

  const byLane: Record<string, FrontierSchedulerLaneThroughputMetrics> = {};
  for (const lane of laneMetrics) byLane[lane.id] = lane;
  return {
    kind: 'frontier.scheduler.throughput',
    version: 1,
    lanes: laneMetrics,
    byLane,
    totals
  };
}

export function summarizeContinuousWorkerPoolCapacity(
  input: ContinuousWorkerPoolCapacityInput
): ContinuousWorkerPoolCapacitySummary {
  if (input === null || typeof input !== 'object') throw new TypeError('continuous worker pool capacity input must be an object');
  const desiredConcurrency = readCount(input.desiredConcurrency, 0, 'desiredConcurrency');
  const activeCount = readCount(input.activeCount, 0, 'activeCount');
  const queuedCount = readCount(input.queuedCount, 0, 'queuedCount');
  const leaseCount = readCount(input.leaseCount, 0, 'leaseCount');
  const reservedCount = readCount(input.reservedCount, 0, 'reservedCount');
  const occupiedCount = activeCount + leaseCount;
  const availableCount = Math.max(0, desiredConcurrency - occupiedCount);
  const launchableCount = Math.max(0, availableCount - reservedCount);
  const wasteCount = Math.max(0, occupiedCount - desiredConcurrency);
  const nextRefillCount = queuedCount > 0 ? Math.min(launchableCount, queuedCount) : 0;
  const idleCount = queuedCount === 0 ? launchableCount : 0;
  const backpressureReason: ContinuousWorkerPoolBackpressureReason = queuedCount === 0
    ? 'none'
    : wasteCount > 0
      ? 'oversubscribed'
      : launchableCount > 0
        ? 'refill-needed'
        : 'at-capacity';

  return {
    desiredConcurrency,
    activeCount,
    queuedCount,
    leaseCount,
    reservedCount,
    occupiedCount,
    availableCount,
    launchableCount,
    nextRefillCount,
    idleCount,
    wasteCount,
    backpressureReason,
    isIdle: idleCount > 0,
    isWaste: wasteCount > 0
  };
}

export function summarizeContinuousWorkerPoolCapacityState(
  input: ContinuousWorkerPoolCapacityStateInput
): ContinuousWorkerPoolCapacityStateSummary {
  if (input === null || typeof input !== 'object') throw new TypeError('continuous worker pool capacity state input must be an object');
  const desiredConcurrency = readCount(input.desiredConcurrency, 0, 'desiredConcurrency');
  const activeCount = readCount(input.activeCount, 0, 'activeCount');
  const queuedCount = readCount(input.queuedCount, 0, 'queuedCount');
  const reviewDrainCount = readCount(input.reviewDrainCount, 0, 'reviewDrainCount');
  const rerunCount = readCount(input.rerunCount, 0, 'rerunCount');
  const conflictCount = readCount(input.conflictCount, 0, 'conflictCount');
  const humanQuestionCount = readCount(input.humanQuestionCount, 0, 'humanQuestionCount');
  const occupiedCount = activeCount + queuedCount + reviewDrainCount + rerunCount + conflictCount + humanQuestionCount;
  const drainedCount = Math.max(0, desiredConcurrency - occupiedCount);
  const overflowCount = Math.max(0, occupiedCount - desiredConcurrency);
  const stateCounts: Record<ContinuousWorkerPoolCapacityState, number> = {
    active: activeCount,
    queued: queuedCount,
    'review-drain': reviewDrainCount,
    rerun: rerunCount,
    conflict: conflictCount,
    'human-question': humanQuestionCount,
    drained: drainedCount
  };

  return {
    kind: 'frontier.scheduler.continuous-pool-capacity-state',
    version: 1,
    desiredConcurrency,
    activeCount,
    queuedCount,
    reviewDrainCount,
    rerunCount,
    conflictCount,
    humanQuestionCount,
    drainedCount,
    overflowCount,
    occupiedCount,
    stateCounts,
    isBlocked: conflictCount > 0 || humanQuestionCount > 0,
    isDrained: occupiedCount === 0
  };
}

export function createContinuousWorkerPoolRefillPlan(
  input: ContinuousWorkerPoolRefillPlanInput = {}
): ContinuousWorkerPoolRefillPlan {
  if (input === null || typeof input !== 'object') throw new TypeError('continuous worker pool refill plan input must be an object');
  if (input.drainQueues !== undefined && !Array.isArray(input.drainQueues)) throw new TypeError('continuous worker pool refill drainQueues must be an array');
  if (input.implementationBacklog !== undefined && !Array.isArray(input.implementationBacklog)) throw new TypeError('continuous worker pool refill implementationBacklog must be an array');

  const generatedAt = readTimeLimit(input.generatedAt, 0, 'generatedAt');
  const maxWorkers = readCount(input.maxWorkers, 0, 'maxWorkers');
  const activeCount = readCount(input.activeCount, 0, 'activeCount');
  const idleSlotCount = Math.max(0, maxWorkers - activeCount);
  const drainQueues = input.drainQueues ?? [];
  const implementationBacklog = input.implementationBacklog ?? [];
  const drainCandidates: ContinuousWorkerPoolRefillCandidate[] = [];
  const implementationCandidates: ContinuousWorkerPoolRefillCandidate[] = [];

  const sortedDrainQueues = drainQueues.map((queue) => readRefillQueue(queue)).sort(compareRefillQueueOrder);
  for (const queue of sortedDrainQueues) {
    const queueCandidates = queue.items.map((item) => createRefillCandidate(item, queue.id, 'drain'));
    queueCandidates.sort(compareRefillCandidateOrder);
    drainCandidates.push(...queueCandidates);
  }

  for (const item of implementationBacklog) {
    implementationCandidates.push(createRefillCandidate(item, undefined, 'implementation'));
  }
  implementationCandidates.sort(compareRefillCandidateOrder);

  const candidates = [...drainCandidates, ...implementationCandidates];
  const slots: ContinuousWorkerPoolRefillSlot[] = [];
  const recommendations: ContinuousWorkerPoolRefillRecommendation[] = [];
  let drainFilledCount = 0;
  let implementationFilledCount = 0;

  for (let index = 0; index < idleSlotCount; index += 1) {
    const slotId = `frontier.scheduler.continuous-refill-slot:${generatedAt}:${index}`;
    const candidate = candidates[index];
    if (candidate === undefined) {
      slots.push({ id: slotId, index, state: 'idle' });
      continue;
    }
    const recommendationId = `frontier.scheduler.continuous-refill-recommendation:${generatedAt}:${index}:${candidate.bucket}:${candidate.queueId ?? 'backlog'}:${candidate.item.id}`;
    slots.push({ id: slotId, index, state: 'fillable', recommendationId });
    recommendations.push({
      id: recommendationId,
      slotId,
      slotIndex: index,
      queueId: candidate.queueId,
      itemId: candidate.item.id,
      bucket: candidate.bucket,
      priority: candidate.priority,
      reasons: candidate.item.reasons?.length ? Array.from(candidate.item.reasons, String) : candidate.bucket === 'drain'
        ? ['local-drain-before-implementation-backlog']
        : ['implementation-backlog-after-local-drain']
    });
    if (candidate.bucket === 'drain') drainFilledCount++;
    else implementationFilledCount++;
  }

  return {
    kind: 'frontier.scheduler.continuous-refill-plan',
    version: 1,
    id: `frontier.scheduler.continuous-refill-plan:${generatedAt}`,
    generatedAt,
    maxWorkers,
    activeCount,
    idleSlotCount,
    drainQueueCount: drainQueues.length,
    drainItemCount: drainCandidates.length,
    implementationBacklogCount: implementationCandidates.length,
    filledSlotCount: recommendations.length,
    drainFilledCount,
    implementationFilledCount,
    slots,
    recommendations
  };
}

export function summarizeContinuousWorkerPoolTargetFeedback(
  input: ContinuousWorkerPoolTargetFeedbackInput
): ContinuousWorkerPoolTargetFeedbackSummary {
  if (input === null || typeof input !== 'object') throw new TypeError('continuous worker pool target feedback input must be an object');
  const minTarget = readCount(input.minTarget, 5, 'minTarget');
  const maxTarget = readCount(input.maxTarget, 10, 'maxTarget');
  if (maxTarget < minTarget) throw new RangeError('maxTarget must be greater than or equal to minTarget');
  const usefulOutputCount = readNonNegativeValue(input.usefulOutputCount, 0, 'usefulOutputCount');
  const cpuPressure = readNonNegativeValue(input.cpuPressure, 0, 'cpuPressure');
  const reviewDebt = readNonNegativeValue(input.reviewDebt, 0, 'reviewDebt');
  const usefulOutputScore = saturatingScore(usefulOutputCount, 4);
  const cpuPressureScore = clampUnit(cpuPressure);
  const reviewDebtScore = saturatingScore(reviewDebt, 4);
  const targetConcurrency = clampRange(
    Math.round(minTarget + (maxTarget - minTarget) * clampUnit(0.5 + 0.5 * usefulOutputScore - 0.3 * cpuPressureScore - 0.2 * reviewDebtScore)),
    minTarget,
    maxTarget
  );

  return {
    minTarget,
    maxTarget,
    usefulOutputCount,
    cpuPressure,
    reviewDebt,
    usefulOutputScore,
    cpuPressureScore,
    reviewDebtScore,
    targetConcurrency
  };
}

export function recommendContinuousWorkerPoolTarget(
  input: ContinuousWorkerPoolTargetFeedbackInput
): number {
  return summarizeContinuousWorkerPoolTargetFeedback(input).targetConcurrency;
}

export const adjustContinuousWorkerPoolTarget = recommendContinuousWorkerPoolTarget;

export function summarizeLocalQueueConcurrencyCaps(
  input: LocalQueueConcurrencyCapsInput
): LocalQueueConcurrencyCapsSummary {
  if (input === null || typeof input !== 'object') throw new TypeError('local queue concurrency caps input must be an object');
  if (!Array.isArray(input.scopes)) throw new TypeError('local queue concurrency caps scopes must be an array');

  const scopes: LocalQueueConcurrencyScopeSummary[] = [];
  const byScope: Record<string, LocalQueueConcurrencyScopeSummary> = {};
  let activeScopeCount = 0;
  let queuedScopeCount = 0;
  let activeLeaderCount = 0;
  let queuedCount = 0;
  let launchableCount = 0;
  let blockedCount = 0;
  let leaderBlockedScopeCount = 0;
  let oversubscribedScopeCount = 0;

  for (const scopeInput of input.scopes) {
    const scope = readLocalQueueConcurrencyScope(scopeInput);
    if (byScope[scope.id] !== undefined) throw new TypeError('duplicate local queue scope id: ' + scope.id);
    scopes[scopes.length] = scope;
    byScope[scope.id] = scope;
    activeLeaderCount += scope.activeCount;
    queuedCount += scope.queuedCount;
    if (scope.isActive) activeScopeCount++;
    if (scope.queuedCount > 0) queuedScopeCount++;
    if (scope.launchableCount > 0) launchableCount += scope.launchableCount;
    if (scope.blockedCount > 0) blockedCount += scope.blockedCount;
    if (scope.isActive && scope.queuedCount > 0) leaderBlockedScopeCount++;
    if (scope.isOversubscribed) oversubscribedScopeCount++;
  }

  const backpressureReason: LocalQueueConcurrencyBackpressureReason = queuedCount === 0
    ? 'none'
    : oversubscribedScopeCount > 0
      ? 'oversubscribed'
      : launchableCount > 0
        ? 'refill-needed'
        : 'at-capacity';

  return {
    kind: 'frontier.scheduler.local-queue-concurrency-caps',
    version: 1,
    scopeCount: scopes.length,
    activeScopeCount,
    queuedScopeCount,
    activeLeaderCount,
    queuedCount,
    launchableCount,
    blockedCount,
    leaderBlockedScopeCount,
    oversubscribedScopeCount,
    backpressureReason,
    isBackpressured: backpressureReason !== 'none',
    scopes,
    byScope
  };
}

export const summarizeApplyLeaderConcurrencyCaps = summarizeLocalQueueConcurrencyCaps;

export function summarizeCoordinatorGateRunCapacity(
  input: CoordinatorGateRunCapacityInput
): CoordinatorGateRunCapacitySummary {
  if (input === null || typeof input !== 'object') throw new TypeError('coordinator gate run capacity input must be an object');
  const now = readTimeLimit(input.now, defaultClock(), 'now');
  const heartbeatGraceMs = readTimeLimit(input.heartbeatGraceMs, 0, 'heartbeatGraceMs');
  const leaseCounts = summarizeLeaseAwarePoolLeases(input.leases, now, heartbeatGraceMs);
  const targetConcurrency = readCount(input.targetConcurrency, 0, 'targetConcurrency');
  const activeCount = readCount(input.activeCount, leaseCounts.activeCount, 'activeCount');
  const gateRunCount = readCount(input.gateRunCount, 0, 'gateRunCount');
  const applyCount = readCount(input.applyCount, 0, 'applyCount');
  const repairCount = readCount(input.repairCount, 0, 'repairCount');
  const rerunCount = readCount(input.rerunCount, 0, 'rerunCount');
  const speculativeBacklogCount = readCount(input.speculativeBacklogCount, 0, 'speculativeBacklogCount');
  const blockedHumanCount = readCount(input.blockedHumanCount, 0, 'blockedHumanCount');
  const staleLeaseCount = readCount(input.staleLeaseCount, leaseCounts.staleLeaseCount, 'staleLeaseCount');
  const gateDrainPressure = gateRunCount + applyCount + repairCount + rerunCount;
  // Drain reservations must consume launch slots before speculative backlog refills start.
  const reservedCount = gateDrainPressure + staleLeaseCount;
  const availableCount = Math.max(0, targetConcurrency - activeCount);
  const launchableCount = Math.max(0, availableCount - reservedCount);
  const suggestedRefillCount = Math.min(launchableCount, speculativeBacklogCount);

  return {
    targetConcurrency,
    activeCount,
    gateRunCount,
    applyCount,
    repairCount,
    rerunCount,
    speculativeBacklogCount,
    blockedHumanCount,
    staleLeaseCount,
    gateDrainPressure,
    reservedCount,
    availableCount,
    launchableCount,
    suggestedRefillCount,
    isIdle: activeCount === 0 && speculativeBacklogCount === 0 && reservedCount === 0
  };
}

export function summarizeLeaseAwarePoolCapacity(
  input: LeaseAwarePoolCapacityInput
): LeaseAwarePoolCapacitySummary {
  if (input === null || typeof input !== 'object') throw new TypeError('lease aware pool capacity input must be an object');
  const now = readTimeLimit(input.now, defaultClock(), 'now');
  const heartbeatGraceMs = readTimeLimit(input.heartbeatGraceMs, 0, 'heartbeatGraceMs');
  const leaseCounts = summarizeLeaseAwarePoolLeases(input.leases, now, heartbeatGraceMs);
  const gateRunCapacity = summarizeCoordinatorGateRunCapacity({
    targetConcurrency: readCount(input.targetConcurrency, 0, 'targetConcurrency'),
    activeCount: readCount(input.activeCount, leaseCounts.activeCount, 'activeCount'),
    gateRunCount: readCount(input.reviewCount, 0, 'reviewCount'),
    applyCount: readCount(input.applyCount, 0, 'applyCount'),
    repairCount: readCount(input.repairCount, 0, 'repairCount'),
    rerunCount: readCount(input.rerunCount, 0, 'rerunCount'),
    speculativeBacklogCount: readCount(input.queuedCount, 0, 'queuedCount'),
    blockedHumanCount: readCount(input.blockedHumanCount, 0, 'blockedHumanCount'),
    staleLeaseCount: readCount(input.staleLeaseCount, leaseCounts.staleLeaseCount, 'staleLeaseCount'),
    heartbeatGraceMs
  });

  return {
    targetConcurrency: gateRunCapacity.targetConcurrency,
    activeCount: gateRunCapacity.activeCount,
    queuedCount: gateRunCapacity.speculativeBacklogCount,
    reviewCount: gateRunCapacity.gateRunCount,
    repairCount: gateRunCapacity.repairCount,
    rerunCount: gateRunCapacity.rerunCount,
    applyCount: gateRunCapacity.applyCount,
    blockedHumanCount: gateRunCapacity.blockedHumanCount,
    staleLeaseCount: gateRunCapacity.staleLeaseCount,
    reviewDrainPressure: gateRunCapacity.gateDrainPressure,
    reservedCount: gateRunCapacity.reservedCount,
    availableCount: gateRunCapacity.availableCount,
    launchableCount: gateRunCapacity.launchableCount,
    suggestedRefillCount: gateRunCapacity.suggestedRefillCount,
    isIdle: gateRunCapacity.isIdle
  };
}

export function summarizeModelAwarePoolCapacity(
  input: ModelAwarePoolCapacityInput
): ModelAwarePoolCapacitySummary {
  if (input === null || typeof input !== 'object') throw new TypeError('model aware pool capacity input must be an object');
  if (!Array.isArray(input.tiers)) throw new TypeError('model aware pool capacity tiers must be an array');
  const budgetRemaining = readNonNegativeLimit(input.budgetRemaining, Infinity, 'budgetRemaining');
  const escalationBudgetRemaining = readNonNegativeLimit(input.escalationBudgetRemaining, Infinity, 'escalationBudgetRemaining');
  const expensiveTierId = normalizeId(input.expensiveTierId ?? 'deep', 'expensive tier id');
  const tiers: ModelAwarePoolTierCapacitySummary[] = [];
  const byTier: Record<string, ModelAwarePoolTierCapacitySummary> = {};
  const openSlotsByTier: Record<string, number> = {};
  let totalOpenSlots = 0;
  let totalQueuedCount = 0;
  let expensiveTierSummary: ModelAwarePoolTierCapacitySummary | undefined;

  for (const tierInput of input.tiers) {
    const summary = summarizeModelAwarePoolTierCapacity(tierInput, expensiveTierId);
    if (byTier[summary.id] !== undefined) throw new TypeError('duplicate model aware pool tier id: ' + summary.id);
    tiers[tiers.length] = summary;
    byTier[summary.id] = summary;
    openSlotsByTier[summary.id] = summary.openSlots;
    totalOpenSlots += summary.openSlots;
    totalQueuedCount += summary.queuedCount;
    if (summary.id === expensiveTierId) expensiveTierSummary = summary;
  }

  if (expensiveTierSummary === undefined) {
    expensiveTierSummary = summarizeModelAwarePoolTierCapacity({ id: expensiveTierId, desiredConcurrency: 0 }, expensiveTierId);
    byTier[expensiveTierId] = expensiveTierSummary;
    openSlotsByTier[expensiveTierId] = expensiveTierSummary.openSlots;
  }

  const expensiveTierOpenSlots = expensiveTierSummary.openSlots;
  const expensiveTierSaturation = expensiveTierSummary.desiredConcurrency === 0
    ? expensiveTierSummary.occupiedCount + expensiveTierSummary.queuedCount
    : (expensiveTierSummary.occupiedCount + expensiveTierSummary.queuedCount) / expensiveTierSummary.desiredConcurrency;
  const budgetExhausted = budgetRemaining <= 0;
  const escalationBudgetExhausted = escalationBudgetRemaining <= 0;
  const cheaperOpenSlots = totalOpenSlots - expensiveTierOpenSlots;
  let backpressureReason: ModelAwarePoolBackpressureReason = 'none';
  let downgradeAdvice: ModelAwarePoolDowngradeAdvice = 'none';

  if (budgetExhausted) {
    backpressureReason = 'budget-exhausted';
    downgradeAdvice = 'backpressure';
  } else if (escalationBudgetExhausted) {
    backpressureReason = 'escalation-budget-exhausted';
    downgradeAdvice = 'backpressure';
  } else if (expensiveTierSaturation >= 1 && cheaperOpenSlots > 0 && totalQueuedCount > 0) {
    backpressureReason = 'expensive-tier-saturated';
    downgradeAdvice = 'downgrade';
  } else if (totalQueuedCount > 0 && totalOpenSlots === 0) {
    backpressureReason = 'at-capacity';
    downgradeAdvice = 'backpressure';
  } else if (totalQueuedCount > 0) {
    backpressureReason = 'refill-needed';
  }

  return {
    tiers,
    byTier,
    openSlotsByTier,
    totalOpenSlots,
    totalQueuedCount,
    budgetRemaining,
    escalationBudgetRemaining,
    budgetExhausted,
    escalationBudgetExhausted,
    expensiveTierId,
    expensiveTierOpenSlots,
    expensiveTierSaturation,
    backpressureReason,
    downgradeAdvice,
    isBackpressured: backpressureReason !== 'none'
  };
}

export function summarizeModelAwarePoolSlotAllocation(
  input: ModelAwarePoolSlotAllocationInput
): ModelAwarePoolSlotAllocationSummary {
  if (input === null || typeof input !== 'object') throw new TypeError('model aware pool slot allocation input must be an object');
  const capacity = summarizeModelAwarePoolCapacity(input);
  const requestedSlots = readCount(input.requestedSlots, capacity.totalOpenSlots, 'requestedSlots');
  const allocationByTier: Record<string, number> = {};
  const allocationTiers: ModelAwarePoolTierCapacitySummary[] = [];
  const nonExpensiveTiers: ModelAwarePoolTierCapacitySummary[] = [];
  let expensiveTierSummary: ModelAwarePoolTierCapacitySummary | undefined;
  let remainingSlots = requestedSlots;
  const pressureAwareOrder = capacity.backpressureReason !== 'none';

  for (const tier of capacity.tiers) {
    allocationTiers[allocationTiers.length] = tier;
    if (tier.id === capacity.expensiveTierId) {
      expensiveTierSummary = tier;
    } else {
      nonExpensiveTiers[nonExpensiveTiers.length] = tier;
    }
  }

  if (expensiveTierSummary === undefined) {
    expensiveTierSummary = summarizeModelAwarePoolTierCapacity({ id: capacity.expensiveTierId, desiredConcurrency: 0 }, capacity.expensiveTierId);
    allocationTiers[allocationTiers.length] = expensiveTierSummary;
  }

  const expensiveTierAllowed = !capacity.budgetExhausted
    && !capacity.escalationBudgetExhausted
    && capacity.backpressureReason !== 'expensive-tier-saturated';

  const allocatableTiers = pressureAwareOrder
    ? nonExpensiveTiers
        .map((tier, index) => ({ tier, index }))
        .sort((left, right) => compareModelAwarePoolTierAllocationPressure(left.tier, right.tier, left.index - right.index))
        .map(({ tier }) => tier)
    : nonExpensiveTiers;

  for (const tier of allocatableTiers) {
    const allocatedSlots = Math.min(tier.openSlots, remainingSlots);
    allocationByTier[tier.id] = allocatedSlots;
    remainingSlots -= allocatedSlots;
  }

  if (expensiveTierSummary !== undefined) {
    const allocatedSlots = expensiveTierAllowed ? Math.min(expensiveTierSummary.openSlots, remainingSlots) : 0;
    allocationByTier[expensiveTierSummary.id] = allocatedSlots;
    remainingSlots -= allocatedSlots;
  }

  const tiers: ModelAwarePoolSlotAllocationTierSummary[] = [];
  const byTier: Record<string, ModelAwarePoolSlotAllocationTierSummary> = {};

  for (const tier of allocationTiers) {
    const allocatedSlots = allocationByTier[tier.id] ?? 0;
    const summary = {
      id: tier.id,
      openSlots: tier.openSlots,
      allocatedSlots,
      deferredSlots: Math.max(0, tier.openSlots - allocatedSlots),
      isExpensiveTier: tier.isExpensiveTier
    };
    tiers[tiers.length] = summary;
    byTier[summary.id] = summary;
  }

  return {
    kind: 'frontier.scheduler.model-aware-pool-slot-allocation',
    requestedSlots,
    allocatedSlots: requestedSlots - remainingSlots,
    deferredSlots: remainingSlots,
    allocationByTier,
    tiers,
    byTier,
    budgetRemaining: capacity.budgetRemaining,
    escalationBudgetRemaining: capacity.escalationBudgetRemaining,
    budgetExhausted: capacity.budgetExhausted,
    escalationBudgetExhausted: capacity.escalationBudgetExhausted,
    expensiveTierId: capacity.expensiveTierId,
    expensiveTierAllocatedSlots: allocationByTier[capacity.expensiveTierId] ?? 0,
    backpressureReason: capacity.backpressureReason,
    downgradeAdvice: capacity.downgradeAdvice,
    isBackpressured: capacity.isBackpressured
  };
}

function compareModelAwarePoolTierAllocationPressure(
  left: ModelAwarePoolTierCapacitySummary,
  right: ModelAwarePoolTierCapacitySummary,
  stableOrder: number
): number {
  if (left.saturation !== right.saturation) return right.saturation - left.saturation;
  if (left.queuedCount !== right.queuedCount) return right.queuedCount - left.queuedCount;
  if (left.openSlots !== right.openSlots) return left.openSlots - right.openSlots;
  return stableOrder;
}

export function deserializeSchedulerState(
  state: FrontierSchedulerSerializedState,
  options: FrontierSchedulerOptions = {}
): FrontierScheduler {
  if (state === null || typeof state !== 'object') throw new TypeError('invalid scheduler state');
  if (state.kind !== 'frontier.scheduler.state') throw new TypeError('invalid scheduler state kind');
  if (state.version !== 1) throw new TypeError('unsupported scheduler state version');
  const scheduler = new Scheduler({
    ...options,
    lanes: state.lanes.map((lane) => ({
      id: lane.id,
      priority: lane.priority,
      maxQueued: lane.maxQueued,
      backpressure: lane.backpressure
    }))
  });
  scheduler.loadSerialized(state);
  return scheduler;
}

class Scheduler implements FrontierScheduler {
  private readonly options: FrontierSchedulerOptions;
  private readonly lanes = new Map<string, InternalLane>();
  private readonly queues = new Map<string, InternalTask[]>();
  private readonly pendingTasksById = new Map<string, InternalTask>();
  private readonly queuedTasksByKey = new Map<string, Map<string, InternalTask[]>>();
  private readonly records: FrontierSchedulerRecord[] = [];
  private readonly completedTaskIds = new Set<string>();
  private readonly maxHistory: number;
  private readonly clock: () => number;
  private sequence = 0;
  private nextRecordId = 1;
  private pending = 0;
  private frameScheduled = false;

  constructor(options: FrontierSchedulerOptions) {
    this.options = options;
    this.clock = options.clock ?? defaultClock;
    this.maxHistory = readNonNegativeLimit(options.maxHistory, 2048, 'maxHistory');
    for (const lane of options.lanes ?? []) this.ensureLane(typeof lane === 'string' ? { id: lane } : lane);
    this.ensureLane({ id: options.defaultLane ?? 'default' });
  }

  schedule<TInput = unknown>(task: FrontierSchedulerTask<TInput>): FrontierScheduledTask<TInput> {
    if (task === null || typeof task !== 'object') throw new TypeError('scheduler task must be an object');
    if (typeof task.run !== 'function' && (task.type === undefined || typeof this.options.handlers?.[task.type] !== 'function')) {
      throw new TypeError('scheduler task requires run() or a registered type handler');
    }
    const laneId = normalizeId(task.lane ?? task.area ?? this.options.defaultLane ?? 'default', 'lane id');
    const lane = this.ensureLane({ id: laneId });
    const queue = this.queueFor(lane.id);
    const key = task.key === undefined ? undefined : String(task.key);
    const existingByKey = key === undefined || (lane.backpressure !== 'coalesce-key' && lane.backpressure !== 'replace-key')
      ? undefined
      : this.firstQueuedTaskByKey(lane.id, key);
    if (existingByKey !== undefined && lane.backpressure === 'coalesce-key') {
      this.recordDropped(task, lane, 'coalesced');
      return existingByKey.view as FrontierScheduledTask<TInput>;
    }
    if (existingByKey !== undefined && lane.backpressure === 'replace-key') {
      this.dropTask(existingByKey, 'dropped', 'replaced');
      this.removeQueuedTask(existingByKey);
    } else if (queue.length >= lane.maxQueued) {
      this.applyBackpressure(task, lane, queue);
    }

    const queued = this.createTask(task, lane);
    this.enqueueTask(queued);
    if (this.options.autoRun === true) this.requestRun();
    return queued.view as FrontierScheduledTask<TInput>;
  }

  run(options: FrontierSchedulerRunOptions = {}): FrontierSchedulerRunResult {
    const start = readStartMs(options.startMs, this.clock);
    const maxMs = readTimeLimit(options.maxMs ?? this.options.maxMs, Infinity, 'maxMs');
    const maxUnits = readNonNegativeLimit(options.maxUnits ?? this.options.maxUnits, Infinity, 'maxUnits');
    const maxTasks = readNonNegativeLimit(options.maxTasks ?? this.options.maxTasks, Infinity, 'maxTasks');
    const laneFilter = options.lane === undefined ? undefined : normalizeId(options.lane, 'run lane');
    let completed = 0;
    let failed = 0;
    let cancelled = 0;
    let dropped = 0;
    let usedUnits = 0;
    let blocked = 0;

    const usedUnitsByLane = new Map<string, number>();
    while (this.pending > 0 && completed + failed + cancelled + dropped < maxTasks) {
      const now = this.clock();
      if (now - start >= maxMs || usedUnits >= maxUnits) break;
      const task = this.takeNextTask(laneFilter, maxUnits - usedUnits, usedUnitsByLane, now - start);
      if (task === null) {
        blocked = this.countBlocked(laneFilter, maxUnits - usedUnits, usedUnitsByLane, now - start);
        break;
      }
      if (task.status === 'cancelled' || task.status === 'dropped') {
        if (task.status === 'cancelled') cancelled++;
        else dropped++;
        continue;
      }
      task.status = 'running';
      const startedAt = this.clock();
      try {
        const context = this.createContext(task, start, maxMs, maxUnits, () => usedUnits);
        const handler = task.run ?? (task.type === undefined ? undefined : this.options.handlers?.[task.type]);
        if (handler === undefined) throw new TypeError('no scheduler handler registered for task type: ' + task.type);
        handler(context as FrontierSchedulerTaskContext);
        task.status = 'completed';
        this.completedTaskIds.add(task.id);
        completed++;
        this.recordTask(task, 'completed', startedAt);
      } catch (error) {
        task.status = 'failed';
        failed++;
        const record = this.recordTask(task, 'failed', startedAt, undefined, error);
        this.options.onError?.(error, cloneRecord(record));
      }
      usedUnits += task.units;
      usedUnitsByLane.set(task.lane, (usedUnitsByLane.get(task.lane) ?? 0) + task.units);
    }

    const elapsedMs = Math.max(0, this.clock() - start);
    const taskLimitReached = completed + failed + cancelled + dropped >= maxTasks && this.pending > 0;
    return {
      completed,
      failed,
      cancelled,
      dropped,
      pending: this.pending,
      blocked,
      usedUnits,
      elapsedMs,
      budgetExhausted: this.pending > 0 && (elapsedMs >= maxMs || usedUnits >= maxUnits),
      taskLimitReached,
      pendingByLane: this.pendingByLane()
    };
  }

  requestRun(options: FrontierSchedulerFrameOptions = {}): FrontierSchedulerSnapshot {
    if (this.frameScheduled) return this.snapshot();
    const policy = options.policy ?? this.options.framePolicy ?? 'manual';
    if (policy === 'manual') return this.snapshot();
    this.frameScheduled = true;
    const run = () => {
      this.frameScheduled = false;
      this.run(options);
    };
    scheduleFrame(run, policy, options.delayMs ?? this.options.frameDelayMs);
    return this.snapshot();
  }

  cancel(taskId: string, reason = 'cancelled'): boolean {
    const id = normalizeId(taskId, 'task id');
    const task = this.pendingTasksById.get(id);
    if (task === undefined) return false;
    this.removeQueuedTask(task);
    this.dropTask(task, 'cancelled', reason);
    return true;
  }

  cancelLane(laneId: string, reason = 'lane-cancelled'): number {
    const queue = this.queueFor(normalizeId(laneId, 'lane id'));
    const count = queue.length;
    for (const task of queue) {
      this.untrackQueuedTask(task);
      this.dropTask(task, 'cancelled', reason);
    }
    queue.length = 0;
    this.pending -= count;
    return count;
  }

  clear(laneId?: string): number {
    if (laneId !== undefined) {
      const queue = this.queueFor(normalizeId(laneId, 'lane id'));
      const count = queue.length;
      for (const task of queue) {
        this.untrackQueuedTask(task);
        this.dropTask(task, 'dropped', 'cleared');
      }
      queue.length = 0;
      this.pending -= count;
      return count;
    }
    let count = 0;
    for (const queue of this.queues.values()) {
      count += queue.length;
      for (const task of queue) {
        this.untrackQueuedTask(task);
        this.dropTask(task, 'dropped', 'cleared');
      }
      queue.length = 0;
    }
    this.pending = 0;
    return count;
  }

  getPendingCount(laneId?: string): number {
    if (laneId !== undefined) return this.queueFor(normalizeId(laneId, 'lane id')).length;
    return this.pending;
  }

  snapshot(): FrontierSchedulerSnapshot {
    return {
      pending: this.pending,
      pendingByLane: this.pendingByLane(),
      lanes: Array.from(this.lanes.values(), (lane) => this.laneSnapshot(lane))
    };
  }

  metrics(options: FrontierSchedulerThroughputOptions = {}): FrontierSchedulerThroughputMetrics {
    const lanes: (string | FrontierSchedulerLaneSnapshot | FrontierSchedulerThroughputLaneOptions)[] =
      Array.from(this.lanes.values(), (lane) => this.laneSnapshot(lane));
    if (options.lanes !== undefined) lanes.push(...options.lanes);
    return summarizeSchedulerThroughput(this.records, {
      ...options,
      lanes,
      queuedByLane: mergeThroughputCounts(this.pendingByLane(), options.queuedByLane),
      now: options.now ?? this.clock()
    });
  }

  history(): FrontierSchedulerRecord[] {
    return this.records.map(cloneRecord);
  }

  clearHistory(): void {
    this.records.length = 0;
  }

  inspect(): FrontierSchedulerGraph {
    const nodes: FrontierSchedulerGraphNode[] = [];
    const edges: FrontierSchedulerGraphEdge[] = [];
    for (const lane of this.lanes.values()) {
      nodes[nodes.length] = { id: 'lane:' + lane.id, kind: 'lane', label: lane.id };
      for (const task of this.queueFor(lane.id)) {
        nodes[nodes.length] = { id: 'task:' + task.id, kind: 'task', label: task.type ?? task.id, status: task.status, metadata: cloneMetadata(task.metadata) };
        edges[edges.length] = { from: 'lane:' + lane.id, to: 'task:' + task.id, kind: 'contains' };
        this.addTaskGraphEdges(task, edges);
      }
    }
    for (const record of this.records) {
      nodes[nodes.length] = { id: 'record:' + record.id, kind: 'record', label: record.type ?? record.taskId, status: record.status, metadata: cloneMetadata(record.metadata) };
      edges[edges.length] = { from: 'task:' + record.taskId, to: 'record:' + record.id, kind: 'runs' };
      this.addRecordGraphEdges(record, edges);
    }
    return { nodes, edges };
  }

  serialize(options: FrontierSchedulerSerializeOptions = {}): FrontierSchedulerSerializedState {
    const pending: FrontierSchedulerSerializedTask[] = [];
    for (const lane of this.lanes.values()) {
      for (const task of this.queueFor(lane.id)) pending[pending.length] = serializeTask(task);
    }
    return {
      kind: 'frontier.scheduler.state',
      version: 1,
      lanes: Array.from(this.lanes.values(), (lane) => this.laneSnapshot(lane)),
      pending,
      completedTaskIds: Array.from(this.completedTaskIds),
      records: options.includeHistory === true ? this.history() : undefined
    };
  }

  loadSerialized(state: FrontierSchedulerSerializedState): void {
    this.completedTaskIds.clear();
    for (const id of state.completedTaskIds) this.completedTaskIds.add(String(id));
    this.records.length = 0;
    this.nextRecordId = 1;
    for (const record of state.records ?? []) {
      this.records[this.records.length] = cloneRecord(record);
      this.nextRecordId = Math.max(this.nextRecordId, readRecordNumber(record.id) + 1);
    }
    for (const task of state.pending) {
      const lane = this.ensureLane({ id: task.lane });
      if (task.type === undefined || typeof this.options.handlers?.[task.type] !== 'function') {
        throw new TypeError('scheduler serialized task requires a registered type handler: ' + (task.type ?? task.id));
      }
      this.enqueueTask(this.createTask({
        id: task.id,
        type: task.type,
        input: cloneSerializable(task.input),
        lane: task.lane,
        area: task.area,
        priority: task.priority,
        units: task.units,
        key: task.key,
        causeId: task.causeId,
        parentId: task.parentId,
        dependsOn: task.dependsOn,
        metadata: cloneMetadata(task.metadata)
      }, lane, { queuedAt: task.queuedAt, sequence: task.sequence }));
    }
  }

  private createTask<TInput>(
    task: FrontierSchedulerTask<TInput>,
    lane: InternalLane,
    restore?: { queuedAt?: number; sequence?: number }
  ): InternalTask<TInput> {
    const sequence = readSequence(restore?.sequence ?? this.sequence + 1);
    const id = normalizeId(task.id ?? (task.type ?? lane.id) + '-' + sequence, 'task id');
    this.sequence = Math.max(this.sequence, sequence);
    const queued: InternalTask<TInput> = {
      id,
      type: task.type,
      input: cloneSerializable(task.input) as TInput,
      lane: lane.id,
      area: task.area ?? lane.id,
      priority: readPriority(task.priority),
      units: readUnits(task.units ?? 1, 'task.units'),
      key: task.key === undefined ? undefined : String(task.key),
      causeId: task.causeId,
      parentId: task.parentId,
      dependsOn: Array.from(task.dependsOn ?? [], String),
      metadata: cloneMetadata(task.metadata),
      queuedAt: restore?.queuedAt ?? this.clock(),
      sequence,
      status: 'queued',
      run: task.run
    } as InternalTask<TInput>;
    queued.view = this.publicTask(queued);
    return queued;
  }

  private publicTask<TInput>(task: InternalTask<TInput>): FrontierScheduledTask<TInput> {
    const scheduler = this;
    return {
      get id() { return task.id; },
      get type() { return task.type; },
      get input() { return task.input; },
      get lane() { return task.lane; },
      get area() { return task.area; },
      get priority() { return task.priority; },
      get units() { return task.units; },
      get key() { return task.key; },
      get causeId() { return task.causeId; },
      get parentId() { return task.parentId; },
      get dependsOn() { return task.dependsOn.slice(); },
      get metadata() { return cloneMetadata(task.metadata); },
      get queuedAt() { return task.queuedAt; },
      get sequence() { return task.sequence; },
      get status() { return task.status; },
      cancel(reason?: string) {
        return scheduler.cancel(task.id, reason);
      }
    };
  }

  private enqueueTask<TInput>(task: InternalTask<TInput>): void {
    if (this.pendingTasksById.has(task.id)) throw new TypeError('scheduler task id is already queued: ' + task.id);
    insertTask(this.queueFor(task.lane), task as InternalTask);
    this.trackQueuedTask(task as InternalTask);
    this.pending++;
  }

  private applyBackpressure(task: FrontierSchedulerTask<any>, lane: InternalLane, queue: InternalTask[]): void {
    switch (lane.backpressure) {
      case 'queue':
        return;
      case 'drop-new':
        this.recordDropped(task, lane, 'backpressure');
        throw new FrontierSchedulerDroppedError('scheduler task dropped by backpressure');
      case 'throw':
        throw new FrontierSchedulerBackpressureError('scheduler lane is full: ' + lane.id);
      case 'drop-old':
      case 'cancel-old': {
        const oldest = oldestTask(queue);
        if (oldest !== undefined) {
          this.removeQueuedTask(oldest);
          this.dropTask(oldest, lane.backpressure === 'cancel-old' ? 'cancelled' : 'dropped', 'backpressure');
        }
        return;
      }
      case 'replace-key':
      case 'coalesce-key':
        this.recordDropped(task, lane, 'backpressure');
        throw new FrontierSchedulerDroppedError('scheduler task dropped by backpressure');
    }
  }

  private takeNextTask(
    laneFilter: string | undefined,
    remainingUnits: number,
    usedUnitsByLane: Map<string, number>,
    elapsedMs: number
  ): InternalTask | null {
    let best: InternalTask | null = null;
    let bestLane: InternalLane | undefined;
    let bestQueue: InternalTask[] | undefined;
    let bestIndex = -1;
    for (const lane of this.lanes.values()) {
      if (laneFilter !== undefined && lane.id !== laneFilter) continue;
      const queue = this.queueFor(lane.id);
      for (let index = 0; index < queue.length; index++) {
        const task = queue[index];
        if (!this.canRunTask(task, lane, remainingUnits, usedUnitsByLane, elapsedMs)) continue;
        if (
          best === null ||
          lane.priority > (bestLane as InternalLane).priority ||
          lane.priority === (bestLane as InternalLane).priority && compareTaskOrder(task, best) < 0
        ) {
          best = task;
          bestLane = lane;
          bestQueue = queue;
          bestIndex = index;
        }
        break;
      }
    }
    if (best === null) return null;
    (bestQueue as InternalTask[]).splice(bestIndex, 1);
    this.untrackQueuedTask(best);
    this.pending--;
    return best;
  }

  private canRunTask(
    task: InternalTask,
    lane: InternalLane,
    remainingUnits: number,
    usedUnitsByLane: Map<string, number>,
    elapsedMs: number
  ): boolean {
    if (task.units > remainingUnits) return false;
    if ((usedUnitsByLane.get(lane.id) ?? 0) + task.units > lane.maxUnitsPerRun) return false;
    if (elapsedMs >= lane.maxMsPerRun) return false;
    for (const dependency of task.dependsOn) {
      if (!this.completedTaskIds.has(dependency)) return false;
    }
    return true;
  }

  private countBlocked(
    laneFilter: string | undefined,
    remainingUnits: number,
    usedUnitsByLane: Map<string, number>,
    elapsedMs: number
  ): number {
    let count = 0;
    for (const lane of this.lanes.values()) {
      if (laneFilter !== undefined && lane.id !== laneFilter) continue;
      for (const task of this.queueFor(lane.id)) {
        if (!this.canRunTask(task, lane, remainingUnits, usedUnitsByLane, elapsedMs)) count++;
      }
    }
    return count;
  }

  private createContext(
    task: InternalTask,
    startMs: number,
    maxMs: number,
    maxUnits: number,
    usedUnits: () => number
  ): FrontierSchedulerTaskContext {
    return {
      scheduler: this,
      task: task.view,
      input: task.input,
      metadata: task.metadata ?? {},
      shouldYield: (units = 1) => this.clock() - startMs >= maxMs || usedUnits() + readUnits(units, 'units') > maxUnits,
      schedule: (next) => this.schedule({ parentId: task.id, causeId: next.causeId ?? task.causeId, ...next }),
      cancel: (taskId, reason) => this.cancel(taskId, reason)
    };
  }

  private ensureLane(options: string | FrontierSchedulerLaneOptions): InternalLane {
    const input = typeof options === 'string' ? { id: options } : options;
    const id = normalizeId(input.id, 'lane id');
    let lane = this.lanes.get(id);
    if (lane !== undefined) {
      lane.priority = readPriority(input.priority ?? lane.priority);
      lane.maxQueued = readNonNegativeLimit(input.maxQueued, lane.maxQueued, 'lane.maxQueued');
      lane.maxUnitsPerRun = readNonNegativeLimit(input.maxUnitsPerRun, lane.maxUnitsPerRun, 'lane.maxUnitsPerRun');
      lane.maxMsPerRun = readTimeLimit(input.maxMsPerRun, lane.maxMsPerRun, 'lane.maxMsPerRun');
      lane.backpressure = input.backpressure ?? lane.backpressure;
      return lane;
    }
    lane = {
      id,
      priority: readPriority(input.priority),
      maxQueued: readNonNegativeLimit(input.maxQueued, Infinity, 'lane.maxQueued'),
      maxUnitsPerRun: readNonNegativeLimit(input.maxUnitsPerRun, Infinity, 'lane.maxUnitsPerRun'),
      maxMsPerRun: readTimeLimit(input.maxMsPerRun, Infinity, 'lane.maxMsPerRun'),
      backpressure: input.backpressure ?? this.options.defaultBackpressure ?? 'queue'
    };
    this.lanes.set(id, lane);
    this.queues.set(id, []);
    return lane;
  }

  private queueFor(laneId: string): InternalTask[] {
    const lane = this.ensureLane({ id: laneId });
    let queue = this.queues.get(lane.id);
    if (queue === undefined) {
      queue = [];
      this.queues.set(lane.id, queue);
    }
    return queue;
  }

  private trackQueuedTask(task: InternalTask): void {
    this.pendingTasksById.set(task.id, task);
    if (task.key === undefined) return;
    let keyedByLane = this.queuedTasksByKey.get(task.lane);
    if (keyedByLane === undefined) {
      keyedByLane = new Map();
      this.queuedTasksByKey.set(task.lane, keyedByLane);
    }
    let keyedTasks = keyedByLane.get(task.key);
    if (keyedTasks === undefined) {
      keyedTasks = [];
      keyedByLane.set(task.key, keyedTasks);
    }
    keyedTasks[keyedTasks.length] = task;
  }

  private untrackQueuedTask(task: InternalTask): void {
    this.pendingTasksById.delete(task.id);
    if (task.key === undefined) return;
    const keyedByLane = this.queuedTasksByKey.get(task.lane);
    const keyedTasks = keyedByLane?.get(task.key);
    if (keyedTasks === undefined) return;
    const index = keyedTasks.indexOf(task);
    if (index >= 0) keyedTasks.splice(index, 1);
    if (keyedTasks.length === 0) {
      keyedByLane?.delete(task.key);
      if (keyedByLane?.size === 0) this.queuedTasksByKey.delete(task.lane);
    }
  }

  private firstQueuedTaskByKey(laneId: string, key: string): InternalTask | undefined {
    return this.queuedTasksByKey.get(laneId)?.get(key)?.[0];
  }

  private removeQueuedTask(task: InternalTask): boolean {
    const queue = this.queues.get(task.lane);
    if (queue === undefined) return false;
    const index = queue.indexOf(task);
    if (index < 0) return false;
    queue.splice(index, 1);
    this.untrackQueuedTask(task);
    this.pending--;
    return true;
  }

  private dropTask(task: InternalTask, status: 'cancelled' | 'dropped', reason: string): FrontierSchedulerRecord {
    task.status = status;
    return this.recordTask(task, status, undefined, reason);
  }

  private recordDropped(task: FrontierSchedulerTask<any>, lane: InternalLane, reason: string): void {
    const now = this.clock();
    this.pushRecord({
      id: this.nextRecordIdValue(),
      taskId: String(task.id ?? task.type ?? 'anonymous'),
      type: task.type,
      lane: lane.id,
      area: task.area ?? lane.id,
      key: task.key,
      causeId: task.causeId,
      parentId: task.parentId,
      dependsOn: Array.from(task.dependsOn ?? [], String),
      status: 'dropped',
      queuedAt: now,
      endedAt: now,
      durationMs: 0,
      units: readUnits(task.units ?? 1, 'task.units'),
      priority: readPriority(task.priority),
      sequence: this.sequence + 1,
      metadata: cloneMetadata(task.metadata),
      reason
    });
  }

  private recordTask(
    task: InternalTask,
    status: FrontierSchedulerRecordStatus,
    startedAt?: number,
    reason?: string,
    error?: unknown
  ): FrontierSchedulerRecord {
    const endedAt = this.clock();
    const record: FrontierSchedulerRecord = {
      id: this.nextRecordIdValue(),
      taskId: task.id,
      type: task.type,
      lane: task.lane,
      area: task.area,
      key: task.key,
      causeId: task.causeId,
      parentId: task.parentId,
      dependsOn: task.dependsOn.slice(),
      status,
      queuedAt: task.queuedAt,
      startedAt,
      endedAt,
      durationMs: startedAt === undefined ? 0 : Math.max(0, endedAt - startedAt),
      units: task.units,
      priority: task.priority,
      sequence: task.sequence,
      metadata: cloneMetadata(task.metadata),
      reason,
      error: error === undefined ? undefined : error instanceof Error ? error.message : String(error)
    };
    this.pushRecord(record);
    return record;
  }

  private pushRecord(record: FrontierSchedulerRecord): void {
    this.records[this.records.length] = record;
    if (this.records.length > this.maxHistory) this.records.splice(0, this.records.length - this.maxHistory);
    this.options.onRecord?.(cloneRecord(record));
  }

  private nextRecordIdValue(): string {
    return 'rec-' + this.nextRecordId++;
  }

  private laneSnapshot(lane: InternalLane): FrontierSchedulerLaneSnapshot {
    return {
      id: lane.id,
      priority: lane.priority,
      queued: this.queueFor(lane.id).length,
      maxQueued: lane.maxQueued,
      backpressure: lane.backpressure
    };
  }

  private pendingByLane(): Record<string, number> {
    const out: Record<string, number> = {};
    for (const [lane, queue] of this.queues) if (queue.length !== 0) out[lane] = queue.length;
    return out;
  }

  private addTaskGraphEdges(task: InternalTask, edges: FrontierSchedulerGraphEdge[]): void {
    if (task.causeId !== undefined) edges[edges.length] = { from: 'cause:' + task.causeId, to: 'task:' + task.id, kind: 'caused-by' };
    if (task.parentId !== undefined) edges[edges.length] = { from: 'task:' + task.parentId, to: 'task:' + task.id, kind: 'parent-of' };
    for (const dependency of task.dependsOn) edges[edges.length] = { from: 'task:' + dependency, to: 'task:' + task.id, kind: 'depends-on' };
    if (task.key !== undefined) edges[edges.length] = { from: 'key:' + task.key, to: 'task:' + task.id, kind: 'same-key' };
  }

  private addRecordGraphEdges(record: FrontierSchedulerRecord, edges: FrontierSchedulerGraphEdge[]): void {
    if (record.causeId !== undefined) edges[edges.length] = { from: 'cause:' + record.causeId, to: 'record:' + record.id, kind: 'caused-by' };
    if (record.parentId !== undefined) edges[edges.length] = { from: 'task:' + record.parentId, to: 'record:' + record.id, kind: 'parent-of' };
    for (const dependency of record.dependsOn) edges[edges.length] = { from: 'task:' + dependency, to: 'record:' + record.id, kind: 'depends-on' };
    if (record.key !== undefined) edges[edges.length] = { from: 'key:' + record.key, to: 'record:' + record.id, kind: 'same-key' };
  }
}

export class FrontierSchedulerBackpressureError extends Error {}
export class FrontierSchedulerDroppedError extends Error {}

function createThroughputLane(id: string, maxQueued = Infinity): FrontierSchedulerLaneThroughputMetrics {
  return {
    id,
    active: 0,
    queued: 0,
    completed: 0,
    failed: 0,
    cancelled: 0,
    dropped: 0,
    total: 0,
    totalRuntimeMs: 0,
    completedRuntimeMs: 0,
    failedRuntimeMs: 0,
    totalUnits: 0,
    maxQueued,
    pressure: 0
  };
}

function ensureThroughputLane(
  lanes: Map<string, FrontierSchedulerLaneThroughputMetrics>,
  id: string,
  maxQueued?: number | null
): FrontierSchedulerLaneThroughputMetrics {
  let lane = lanes.get(id);
  if (lane === undefined) {
    lane = createThroughputLane(id, readNonNegativeLimit(maxQueued, Infinity, 'lane.maxQueued'));
    lanes.set(id, lane);
    return lane;
  }
  if (maxQueued !== undefined) lane.maxQueued = readNonNegativeLimit(maxQueued, lane.maxQueued, 'lane.maxQueued');
  return lane;
}

function summarizeModelAwarePoolTierCapacity(
  input: ModelAwarePoolTierCapacityInput,
  expensiveTierId: string
): ModelAwarePoolTierCapacitySummary {
  if (input === null || typeof input !== 'object') throw new TypeError('model aware pool tier capacity input must be an object');
  const id = normalizeId(input.id, 'model aware pool tier id');
  const summary = summarizeContinuousWorkerPoolCapacity(input);
  return {
    ...summary,
    id,
    openSlots: summary.availableCount,
    saturation: (summary.occupiedCount + summary.queuedCount) / Math.max(1, summary.desiredConcurrency),
    isExpensiveTier: id === expensiveTierId
  };
}

interface ContinuousWorkerPoolRefillCandidate {
  item: ContinuousWorkerPoolRefillItem;
  bucket: ContinuousWorkerPoolRefillBucket;
  queueId?: string;
  priority: number;
}

function readRefillQueue(input: ContinuousWorkerPoolRefillQueue): ContinuousWorkerPoolRefillQueue {
  if (input === null || typeof input !== 'object') throw new TypeError('continuous worker pool refill queue must be an object');
  if (!Array.isArray(input.items)) throw new TypeError('continuous worker pool refill queue items must be an array');
  return {
    id: normalizeId(input.id, 'continuous worker pool refill queue id'),
    priority: input.priority,
    items: input.items.map((item) => readRefillItem(item))
  };
}

function readRefillItem(input: ContinuousWorkerPoolRefillItem): ContinuousWorkerPoolRefillItem {
  if (input === null || typeof input !== 'object') throw new TypeError('continuous worker pool refill item must be an object');
  return {
    id: normalizeId(input.id, 'continuous worker pool refill item id'),
    priority: input.priority,
    ...(input.reasons === undefined ? {} : { reasons: Array.from(input.reasons, String) })
  };
}

function createRefillCandidate(
  input: ContinuousWorkerPoolRefillItem,
  queueId: string | undefined,
  bucket: ContinuousWorkerPoolRefillBucket
): ContinuousWorkerPoolRefillCandidate {
  const item = readRefillItem(input);
  return {
    item,
    queueId,
    bucket,
    priority: readPriority(item.priority)
  };
}

function compareRefillCandidateOrder(left: ContinuousWorkerPoolRefillCandidate, right: ContinuousWorkerPoolRefillCandidate): number {
  return right.priority - left.priority
    || left.item.id.localeCompare(right.item.id);
}

function compareRefillQueueOrder(left: ContinuousWorkerPoolRefillQueue, right: ContinuousWorkerPoolRefillQueue): number {
  return readPriority(right.priority) - readPriority(left.priority)
    || left.id.localeCompare(right.id);
}

function readThroughputLane(
  input: string | FrontierSchedulerLaneSnapshot | FrontierSchedulerThroughputLaneOptions
): FrontierSchedulerThroughputLaneOptions {
  if (typeof input === 'string') return { id: normalizeId(input, 'metrics lane id') };
  return {
    id: normalizeId(input.id, 'metrics lane id'),
    maxQueued: input.maxQueued
  };
}

function readLocalQueueConcurrencyScope(input: LocalQueueConcurrencyScopeInput): LocalQueueConcurrencyScopeSummary {
  if (input === null || typeof input !== 'object') throw new TypeError('local queue concurrency scope must be an object');
  const id = normalizeId(input.id, 'local queue scope id');
  const activeCount = readNonNegativeLimit(input.activeCount, 0, 'local queue scope activeCount');
  const queuedCount = readNonNegativeLimit(input.queuedCount, 0, 'local queue scope queuedCount');
  const leaderCapacity = 1;
  const launchableCount = activeCount === 0 && queuedCount > 0 ? 1 : 0;
  const blockedCount = Math.max(0, queuedCount - launchableCount);

  return {
    id,
    activeCount,
    queuedCount,
    leaderCapacity,
    launchableCount,
    blockedCount,
    isActive: activeCount > 0,
    isOversubscribed: activeCount > leaderCapacity
  };
}

function applyThroughputRecord(
  lanes: Map<string, FrontierSchedulerLaneThroughputMetrics>,
  record: FrontierSchedulerThroughputRecord,
  now: number | undefined
): void {
  if (record === null || typeof record !== 'object') throw new TypeError('scheduler throughput record must be an object');
  const lane = ensureThroughputLane(lanes, normalizeId(record.lane ?? 'default', 'metrics record lane'));
  const runtimeMs = readRecordRuntimeMs(record, now);
  const units = record.units === undefined ? 0 : readUnits(record.units, 'record.units');
  switch (record.status) {
    case 'queued':
      lane.queued++;
      break;
    case 'running':
      lane.active++;
      lane.totalRuntimeMs += runtimeMs;
      break;
    case 'completed':
      lane.completed++;
      lane.completedRuntimeMs += runtimeMs;
      lane.totalRuntimeMs += runtimeMs;
      break;
    case 'failed':
      lane.failed++;
      lane.failedRuntimeMs += runtimeMs;
      lane.totalRuntimeMs += runtimeMs;
      break;
    case 'cancelled':
      lane.cancelled++;
      lane.totalRuntimeMs += runtimeMs;
      break;
    case 'dropped':
      lane.dropped++;
      lane.totalRuntimeMs += runtimeMs;
      break;
    case undefined:
      return;
  }
  lane.totalUnits += units;
}

function applyThroughputCounts(
  lanes: Map<string, FrontierSchedulerLaneThroughputMetrics>,
  counts: Record<string, number> | undefined,
  field: 'queued' | 'active',
  label: string
): void {
  if (counts === undefined) return;
  for (const id of Object.keys(counts)) {
    ensureThroughputLane(lanes, normalizeId(id, label + ' lane'))[field] += readNonNegativeLimit(counts[id], 0, label + '.' + id);
  }
}

function summarizeLeaseAwarePoolLeases(
  leases: readonly LeaseAwarePoolLeaseInput[] | undefined,
  now: number,
  heartbeatGraceMs: number
): { activeCount: number; staleLeaseCount: number } {
  let activeCount = 0;
  let staleLeaseCount = 0;
  const graceMs = readTimeLimit(heartbeatGraceMs, 0, 'heartbeatGraceMs');
  for (const lease of leases ?? []) {
    if (lease === null || typeof lease !== 'object') throw new TypeError('lease aware pool lease must be an object');
    const expiresAt = lease.expiresAt === undefined || lease.expiresAt === null
      ? undefined
      : readTimeLimit(lease.expiresAt, 0, 'lease.expiresAt');
    if (expiresAt !== undefined && expiresAt + graceMs <= now) staleLeaseCount++;
    else activeCount++;
  }
  return { activeCount, staleLeaseCount };
}

function readRecordRuntimeMs(record: FrontierSchedulerThroughputRecord, now: number | undefined): number {
  if (record.durationMs !== undefined) return readTimeLimit(record.durationMs, 0, 'record.durationMs');
  if (record.startedAt === undefined) return 0;
  const startedAt = readTimeLimit(record.startedAt, 0, 'record.startedAt');
  const endedAt = record.endedAt === undefined
    ? record.status === 'running' && now !== undefined
      ? readTimeLimit(now, 0, 'metrics.now')
      : undefined
    : readTimeLimit(record.endedAt, 0, 'record.endedAt');
  return endedAt === undefined ? 0 : Math.max(0, endedAt - startedAt);
}

function finalizeThroughputLane(lane: FrontierSchedulerLaneThroughputMetrics): void {
  lane.total = lane.active + lane.queued + lane.completed + lane.failed + lane.cancelled + lane.dropped;
  lane.pressure = calculateLanePressure(lane);
}

function calculateLanePressure(lane: FrontierSchedulerLaneThroughputMetrics): number {
  if (lane.queued <= 0) return 0;
  if (Number.isFinite(lane.maxQueued) && lane.maxQueued > 0) return lane.queued / lane.maxQueued;
  return lane.queued / Math.max(1, lane.active);
}

function addThroughputLane(
  target: FrontierSchedulerLaneThroughputMetrics,
  source: FrontierSchedulerLaneThroughputMetrics
): void {
  target.active += source.active;
  target.queued += source.queued;
  target.completed += source.completed;
  target.failed += source.failed;
  target.cancelled += source.cancelled;
  target.dropped += source.dropped;
  target.totalRuntimeMs += source.totalRuntimeMs;
  target.completedRuntimeMs += source.completedRuntimeMs;
  target.failedRuntimeMs += source.failedRuntimeMs;
  target.totalUnits += source.totalUnits;
}

function totalMaxQueued(lanes: readonly FrontierSchedulerLaneThroughputMetrics[]): number {
  let total = 0;
  let hasWork = false;
  for (const lane of lanes) {
    if (lane.total === 0) continue;
    hasWork = true;
    if (!Number.isFinite(lane.maxQueued)) return Infinity;
    total += lane.maxQueued;
  }
  return hasWork ? total : 0;
}

function mergeThroughputCounts(
  left: Record<string, number>,
  right: Record<string, number> | undefined
): Record<string, number> {
  if (right === undefined) return left;
  const out: Record<string, number> = { ...left };
  for (const id of Object.keys(right)) out[id] = (out[id] ?? 0) + right[id];
  return out;
}

function defaultClock(): number {
  const perf = globalThis.performance;
  return perf && typeof perf.now === 'function' ? perf.now() : Date.now();
}

function normalizeId(value: string, label: string): string {
  if (typeof value !== 'string' || value.length === 0) throw new TypeError(label + ' must be a non-empty string');
  return value;
}

function readPriority(value: FrontierSchedulerPriority | undefined): number {
  if (value === undefined || value === 'normal') return 0;
  if (value === 'critical') return 2;
  if (value === 'high') return 1;
  if (value === 'low') return -1;
  if (value === 'idle') return -2;
  if (!Number.isFinite(value)) throw new RangeError('priority must be finite');
  return value;
}

function readUnits(value: number, label: string): number {
  if (!Number.isFinite(value) || value < 0) throw new RangeError(label + ' must be a non-negative number');
  return Math.floor(value);
}

function readCount(value: number | null | undefined, fallback: number, label: string): number {
  if (value === undefined || value === null) return fallback;
  if (!Number.isFinite(value) || value < 0) throw new RangeError(label + ' must be a non-negative number');
  return Math.floor(value);
}

function readNonNegativeValue(value: number | null | undefined, fallback: number, label: string): number {
  if (value === undefined || value === null) return fallback;
  if (value === Infinity) return Infinity;
  if (!Number.isFinite(value) || value < 0) throw new RangeError(label + ' must be a non-negative number');
  return value;
}

function readNonNegativeLimit(value: number | null | undefined, fallback: number, label: string): number {
  if (value === undefined || value === null) return fallback;
  if (value === Infinity) return Infinity;
  if (!Number.isFinite(value) || value < 0) throw new RangeError(label + ' must be a non-negative number');
  return Math.floor(value);
}

function readTimeLimit(value: number | null | undefined, fallback: number, label: string): number {
  if (value === undefined || value === null) return fallback;
  if (value === Infinity) return Infinity;
  if (!Number.isFinite(value) || value < 0) throw new RangeError(label + ' must be a non-negative number');
  return value;
}

function saturatingScore(value: number, scale: number): number {
  if (!Number.isFinite(value)) return 1;
  if (value <= 0) return 0;
  return value / (value + scale);
}

function clampUnit(value: number): number {
  if (value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
}

function clampRange(value: number, min: number, max: number): number {
  if (value <= min) return min;
  if (value >= max) return max;
  return value;
}

function readStartMs(value: number | undefined, clock: () => number): number {
  if (value === undefined) return clock();
  if (!Number.isFinite(value)) throw new RangeError('startMs must be finite');
  return value;
}

function readSequence(value: number): number {
  if (!Number.isFinite(value) || value < 0) throw new RangeError('task sequence must be a non-negative finite number');
  return Math.floor(value);
}

function readRecordNumber(id: string): number {
  const match = /^rec-(\d+)$/.exec(String(id));
  return match ? Number(match[1]) : 0;
}

function insertTask(queue: InternalTask[], task: InternalTask): void {
  let index = queue.length;
  while (index > 0 && compareTaskOrder(task, queue[index - 1]) < 0) index--;
  queue.splice(index, 0, task);
}

function compareTaskOrder(left: InternalTask, right: InternalTask): number {
  if (left.priority !== right.priority) return right.priority - left.priority;
  return left.sequence - right.sequence;
}

function oldestTask(queue: InternalTask[]): InternalTask | undefined {
  let oldest: InternalTask | undefined;
  for (const task of queue) if (oldest === undefined || task.sequence < oldest.sequence) oldest = task;
  return oldest;
}

function cloneMetadata(value: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
  if (value === undefined) return undefined;
  const cloned = cloneSerializable(value);
  return cloned !== undefined && cloned !== null && typeof cloned === 'object' && !Array.isArray(cloned)
    ? cloned as Record<string, unknown>
    : undefined;
}

const CLONE_SERIALIZABLE_FALLBACK = Symbol('cloneSerializableFallback');

function cloneSerializable<T>(value: T): T | undefined {
  if (value === undefined) return undefined;
  const fast = clonePlainSerializable(value, 0);
  if (fast !== CLONE_SERIALIZABLE_FALLBACK) return fast as T;
  if (value === null || typeof value !== 'object') return value;
  try {
    return JSON.parse(JSON.stringify(value)) as T;
  } catch {
    return undefined;
  }
}

function clonePlainSerializable(value: unknown, depth: number): unknown {
  if (value === null) return null;
  const type = typeof value;
  if (type === 'string' || type === 'boolean') return value;
  if (type === 'number') return Number.isFinite(value) ? value : CLONE_SERIALIZABLE_FALLBACK;
  if (type !== 'object' || depth > 64) return CLONE_SERIALIZABLE_FALLBACK;
  if (Array.isArray(value)) {
    const array = value as unknown[];
    const out = new Array(array.length);
    for (let i = 0, length = array.length; i < length; i++) {
      const child = clonePlainSerializable(array[i], depth + 1);
      if (child === CLONE_SERIALIZABLE_FALLBACK) return CLONE_SERIALIZABLE_FALLBACK;
      out[i] = child;
    }
    return out;
  }
  const proto = Object.getPrototypeOf(value);
  if ((proto !== Object.prototype && proto !== null) || typeof (value as { toJSON?: unknown }).toJSON === 'function') {
    return CLONE_SERIALIZABLE_FALLBACK;
  }
  const source = value as Record<string, unknown>;
  const keys = Object.keys(source);
  const out: Record<string, unknown> = {};
  for (let i = 0, length = keys.length; i < length; i++) {
    const key = keys[i];
    const child = clonePlainSerializable(source[key], depth + 1);
    if (child === CLONE_SERIALIZABLE_FALLBACK) return CLONE_SERIALIZABLE_FALLBACK;
    out[key] = child;
  }
  return out;
}

function cloneRecord(record: FrontierSchedulerRecord): FrontierSchedulerRecord {
  return {
    ...record,
    dependsOn: record.dependsOn.slice(),
    metadata: cloneMetadata(record.metadata)
  };
}

function serializeTask(task: InternalTask): FrontierSchedulerSerializedTask {
  return {
    id: task.id,
    type: task.type,
    input: cloneSerializable(task.input),
    lane: task.lane,
    area: task.area,
    priority: task.priority,
    units: task.units,
    key: task.key,
    causeId: task.causeId,
    parentId: task.parentId,
    dependsOn: task.dependsOn.slice(),
    metadata: cloneMetadata(task.metadata),
    queuedAt: task.queuedAt,
    sequence: task.sequence
  };
}

function scheduleFrame(callback: () => void, policy: FrontierSchedulerFramePolicy, delayMs: number | undefined): void {
  if (policy === 'microtask' && typeof queueMicrotask === 'function') {
    queueMicrotask(callback);
    return;
  }
  const global = globalThis as unknown as {
    requestAnimationFrame?: (callback: () => void) => unknown;
    requestIdleCallback?: (callback: () => void) => unknown;
  };
  if (policy === 'animationFrame' && typeof global.requestAnimationFrame === 'function') {
    global.requestAnimationFrame(callback);
    return;
  }
  if (policy === 'idle' && typeof global.requestIdleCallback === 'function') {
    global.requestIdleCallback(callback);
    return;
  }
  setTimeout(callback, Math.max(0, Math.floor(delayMs ?? 0)));
}
