# @shapeshift-labs/frontier-scheduler

Deterministic Frontier work scheduling, replay, cancellation, backpressure, frame policy, and inspectable work graphs.

This package builds on the low-level idea of `@shapeshift-labs/frontier/runtime`, but owns higher-level scheduling policy: lanes, cancellation, backpressure, frame requests, replay snapshots, queued work, and inspectable work graphs.

- npm: [`@shapeshift-labs/frontier-scheduler`](https://www.npmjs.com/package/@shapeshift-labs/frontier-scheduler)
- source: [`siliconjungle/-shapeshift-labs-frontier-scheduler`](https://github.com/siliconjungle/-shapeshift-labs-frontier-scheduler)
- license: MIT

## Layering Contract

`@shapeshift-labs/frontier/runtime` remains the tiny dependency-free budget and scheduler primitive for core structural work. It exposes only `schedule()`, `run()`, `clear()`, `getPendingCount()`, and `snapshot()`.

`@shapeshift-labs/frontier-scheduler` owns the richer product surface: lanes, deterministic replay, cancellation, backpressure, frame policies, history, serialization, and inspectable work graphs. DOM, virtual, scene, mutation, cache, sync, and logging packages accept structural scheduler-like objects so they can use this implementation without importing it.

## Related Packages

The published Frontier package family is generated from one shared package catalog so READMEs stay in sync across packages:

- [`@shapeshift-labs/frontier`](https://www.npmjs.com/package/@shapeshift-labs/frontier): Core JSON diff/apply, compact patch tuples, JSON Pointer, equality, clone, validation, Unicode helpers, and tiny dependency-free runtime budget/scheduler primitives.
- [`@shapeshift-labs/frontier-query`](https://www.npmjs.com/package/@shapeshift-labs/frontier-query): Shared query-key, selector path, condition, entity identity, and table-shape primitives.
- [`@shapeshift-labs/frontier-codec`](https://www.npmjs.com/package/@shapeshift-labs/frontier-codec): Patch serialization, binary frames, canonical JSON, and patch-history codecs.
- [`@shapeshift-labs/frontier-engine`](https://www.npmjs.com/package/@shapeshift-labs/frontier-engine): Stateful planned diff engine, adaptive profiles, schema plans, and engine-level history helpers.
- [`@shapeshift-labs/frontier-state`](https://www.npmjs.com/package/@shapeshift-labs/frontier-state): Patch-routed app-state subscriptions, owned commits, maintained views, and path mapping.
- [`@shapeshift-labs/frontier-dataflow`](https://www.npmjs.com/package/@shapeshift-labs/frontier-dataflow): Serializable incremental dataflow and materialized-view graphs for Frontier apps, including selectors, dependency DAGs, filters, joins, aggregations, stale paths, recompute budgets, output patches, provenance records, and proof of why derived views changed.
- [`@shapeshift-labs/frontier-state-cache`](https://www.npmjs.com/package/@shapeshift-labs/frontier-state-cache): Normalized query-result cache with entity/query watchers, persistence, change logs, optimistic layers, scheduled persistence, and mutation bridge.
- [`@shapeshift-labs/frontier-state-cache-idb`](https://www.npmjs.com/package/@shapeshift-labs/frontier-state-cache-idb): IndexedDB persistence adapter for Frontier state-cache snapshots and durable change logs.
- [`@shapeshift-labs/frontier-state-cache-file`](https://www.npmjs.com/package/@shapeshift-labs/frontier-state-cache-file): Structured file persistence adapter for Frontier state-cache snapshots and change logs.
- [`@shapeshift-labs/frontier-state-cache-sql`](https://www.npmjs.com/package/@shapeshift-labs/frontier-state-cache-sql): SQL persistence adapter for Frontier state-cache snapshots and change logs.
- [`@shapeshift-labs/frontier-schema`](https://www.npmjs.com/package/@shapeshift-labs/frontier-schema): JSON Schema validation, Frontier profile generation, CloudEvent envelopes, and query/table schema helpers.
- [`@shapeshift-labs/frontier-migrations`](https://www.npmjs.com/package/@shapeshift-labs/frontier-migrations): Boundary-first data migrations, import normalization, plugin/API version mapping, versioned envelopes, graph diagnostics, patch path rewrites, dry-run reports, and current-shape rehydration.
- [`@shapeshift-labs/frontier-event-log`](https://www.npmjs.com/package/@shapeshift-labs/frontier-event-log): Bounded event logs, replay cursors, consumer acknowledgements, keyed compaction, checkpoints, and Frontier patch event records.
- [`@shapeshift-labs/frontier-inspect`](https://www.npmjs.com/package/@shapeshift-labs/frontier-inspect): Cross-package inspection/evidence bundles, registry graph snapshots, feature/resource impact reports, timeline/event normalization, redaction, JSONL import/export, and AI-readable app feature maps.
- [`@shapeshift-labs/frontier-logging`](https://www.npmjs.com/package/@shapeshift-labs/frontier-logging): Opt-in structured logging, browser telemetry, scheduled sinks, file sinks, exporters, benchmark traces, and Frontier patch/update summaries.
- [`@shapeshift-labs/frontier-mutation`](https://www.npmjs.com/package/@shapeshift-labs/frontier-mutation): Explicit mutation and selector plans compiled to Frontier patches or CRDT operations.
- [`@shapeshift-labs/frontier-effects`](https://www.npmjs.com/package/@shapeshift-labs/frontier-effects): Serializable effect descriptors and resource graphs for Frontier apps, including fetch, storage, timers, navigation, workers, clipboard, broadcast, WebSocket, stream, policy metadata, runtime records, redaction, JSONL, proof helpers, and registry graph output.
- [`@shapeshift-labs/frontier-auth`](https://www.npmjs.com/package/@shapeshift-labs/frontier-auth): Frontier-native auth contracts for providers, sessions, profile completeness, route and resource gates, account-linking policy, token issue/verify plans, runtime grants, audit events, registry graphs, lint resources, and auth evidence without owning app secrets, crypto, storage, or provider SDKs.
- [`@shapeshift-labs/frontier-policy`](https://www.npmjs.com/package/@shapeshift-labs/frontier-policy): Serializable policy and capability decisions for Frontier apps, effects, views, sync, routes, traces, and AI tools.
- [`@shapeshift-labs/frontier-flags`](https://www.npmjs.com/package/@shapeshift-labs/frontier-flags): Patchable policy-aware feature flag state for Frontier apps, including targeting, deterministic rollouts, experiment variants, kill switches, exposure records, audit logs, and replay evidence.
- [`@shapeshift-labs/frontier-tools`](https://www.npmjs.com/package/@shapeshift-labs/frontier-tools): Serializable app action/tool manifests for AI-operable Frontier apps, including availability, validation, dry-run plans, patch previews, effect/tool constraints, execution records, rollback links, and registry graph output.
- [`@shapeshift-labs/frontier-sandbox`](https://www.npmjs.com/package/@shapeshift-labs/frontier-sandbox): Runtime-agnostic sandbox contracts for Frontier patch-producing actions, including manifests, declared reads/writes/capabilities, host-validated patch/effect/event/log results, dynamic source modules, source event replay, and structural runtime adapters.
- [`@shapeshift-labs/frontier-sandbox-quickjs`](https://www.npmjs.com/package/@shapeshift-labs/frontier-sandbox-quickjs): QuickJS/WebAssembly runtime adapter for Frontier sandbox actions, including invocation/runtime isolation modes, deadline and memory limits, dynamic source execution, and patch/effect result normalization.
- [`@shapeshift-labs/frontier-workflow`](https://www.npmjs.com/package/@shapeshift-labs/frontier-workflow): Serializable durable workflow/process manifests for Frontier apps, including steps, waits, approvals, timers, retries, expected patches, compensation, records, timelines, and registry graph output.
- [`@shapeshift-labs/frontier-worker`](https://www.npmjs.com/package/@shapeshift-labs/frontier-worker): Serializable worker and edge task descriptors for Frontier apps, including queues, idempotency keys, retry and timeout policy, declared reads/writes/effects, snapshots, patch outputs, produced assets, execution records, logs, trace links, proof hashes, dedupe indexes, and registry graph output.
- [`@shapeshift-labs/frontier-queue`](https://www.npmjs.com/package/@shapeshift-labs/frontier-queue): Serializable durable queue state, leases, retries, dedupe keys, patch-carrying jobs, dead-letter records, replay evidence, and queue inspection for Frontier apps.
- [`@shapeshift-labs/frontier-swarm`](https://www.npmjs.com/package/@shapeshift-labs/frontier-swarm): Hierarchical swarm plans, lanes, compute profiles, ownership policy, semantic ownership regions, task queues, event streams, run records, merge bundles, merge indexes, queue overlays, merge admission, coordinator dashboards, changed-path checks, and proof artifacts for Frontier agent work.
- [`@shapeshift-labs/frontier-swarm-codex`](https://www.npmjs.com/package/@shapeshift-labs/frontier-swarm-codex): Node Codex CLI adapter for Frontier swarm plans, including prompt rendering, worktree and snapshot workspaces, Codex argument compatibility, browser resource allocation, JSONL capture, verification commands, pid-backed stop, collect/apply workflows, merge indexes, queue overlays, merge bundles, normalized job evidence, coordinator query artifacts, and result artifacts.
- [`@shapeshift-labs/frontier-lang-kernel`](https://www.npmjs.com/package/@shapeshift-labs/frontier-lang-kernel): Runtime-neutral semantic source graph, type/lattice/extern declarations, patch bundles, replay, hashing, evidence records, and merge-admission kernel for Frontier Lang.
- [`@shapeshift-labs/frontier-lang-parser`](https://www.npmjs.com/package/@shapeshift-labs/frontier-lang-parser): Dependency-light Frontier Lang parser for modules, entities, state, actions, effects, types, externs, targets, and lattice declarations.
- [`@shapeshift-labs/frontier-lang-checker`](https://www.npmjs.com/package/@shapeshift-labs/frontier-lang-checker): Checker and diagnostics for Frontier Lang semantic documents, including type symbols, effects, regions, lattice laws, CRDT metadata, and patch evidence.
- [`@shapeshift-labs/frontier-lang-typescript`](https://www.npmjs.com/package/@shapeshift-labs/frontier-lang-typescript): TypeScript projection adapter for Frontier Lang semantic documents, including type/entity/state/action/extern declarations and CRDT lattice descriptors.
- [`@shapeshift-labs/frontier-lang-javascript`](https://www.npmjs.com/package/@shapeshift-labs/frontier-lang-javascript): JavaScript projection adapter for Frontier Lang semantic documents, including ESM action stubs and schema/lattice descriptors.
- [`@shapeshift-labs/frontier-lang-rust`](https://www.npmjs.com/package/@shapeshift-labs/frontier-lang-rust): Rust projection adapter for Frontier Lang semantic documents, including structs, aliases, and action stubs.
- [`@shapeshift-labs/frontier-lang-python`](https://www.npmjs.com/package/@shapeshift-labs/frontier-lang-python): Python projection adapter for Frontier Lang semantic documents, including dataclasses, typed patch records, and action stubs.
- [`@shapeshift-labs/frontier-lang-c`](https://www.npmjs.com/package/@shapeshift-labs/frontier-lang-c): C header projection adapter for Frontier Lang semantic documents, including structs and action prototypes.
- [`@shapeshift-labs/frontier-lang-compiler`](https://www.npmjs.com/package/@shapeshift-labs/frontier-lang-compiler): Compiler facade for Frontier Lang source documents, including parse, check, hash, diagnostics, universal AST envelopes, proof/paradigm semantic summaries, projection to TypeScript, JavaScript, Rust, Python, and C, and native source-import adapters for semantic merge evidence.
- [`@shapeshift-labs/frontier-lang-swift`](https://www.npmjs.com/package/@shapeshift-labs/frontier-lang-swift): Swift source-language importer package for Frontier Lang semantic documents, including package-level metadata, SwiftSyntax adapter helpers, native import results, and semantic sidecar generation for SwiftSyntax/SwiftParser-shaped syntax trees.
- [`@shapeshift-labs/frontier-lang-kotlin`](https://www.npmjs.com/package/@shapeshift-labs/frontier-lang-kotlin): Kotlin PSI source-language importer package for Frontier Lang semantic documents, including package-level metadata, Kotlin PSI adapter helpers, native import results, and semantic sidecar generation for Kotlin PSI/KtFile-shaped syntax trees.
- [`@shapeshift-labs/frontier-lang-java`](https://www.npmjs.com/package/@shapeshift-labs/frontier-lang-java): Java source-language importer package for Frontier Lang semantic documents, including package-level metadata, Java AST adapter helpers, native import results, and semantic sidecar generation for javac/JDT/JavaParser-shaped ASTs.
- [`@shapeshift-labs/frontier-lang-go`](https://www.npmjs.com/package/@shapeshift-labs/frontier-lang-go): Go source-language importer package for Frontier Lang semantic documents, including package-level metadata, Go AST adapter helpers, native import results, and semantic sidecar generation for go/ast File or Package trees.
- [`@shapeshift-labs/frontier-lang-csharp`](https://www.npmjs.com/package/@shapeshift-labs/frontier-lang-csharp): C# Roslyn source-language importer package for Frontier Lang semantic documents, including package-level metadata, Roslyn adapter helpers, native import results, and semantic sidecar generation for SyntaxTree/SyntaxNode-shaped ASTs.
- [`@shapeshift-labs/frontier-lang-clang`](https://www.npmjs.com/package/@shapeshift-labs/frontier-lang-clang): Clang AST source-language importer package for Frontier Lang semantic documents, including package-level metadata, Clang AST JSON adapter helpers, native import results, and semantic sidecar generation for C/C++ translation units.
- [`@shapeshift-labs/frontier-lang-cli`](https://www.npmjs.com/package/@shapeshift-labs/frontier-lang-cli): Command line interface for parsing, checking, hashing, emitting, native source import/projection, semantic slicing, and corpus roundtrip evidence for Frontier Lang projects.
- [`@shapeshift-labs/frontier-lang`](https://www.npmjs.com/package/@shapeshift-labs/frontier-lang): Umbrella package for Frontier Lang kernel, parser, checker, compiler facade, universal AST helpers, projection adapters, and source-language importer adapters.
- [`@shapeshift-labs/frontier-kv`](https://www.npmjs.com/package/@shapeshift-labs/frontier-kv): Serializable in-memory key/value state for Frontier apps, including TTL, versioned compare-and-set, batched patch mutations, scans, watchers, snapshots, JSONL event evidence, and replay verification.
- [`@shapeshift-labs/frontier-kv-locks`](https://www.npmjs.com/package/@shapeshift-labs/frontier-kv-locks): Lease-style lock records on top of Frontier KV, including acquire, renew, release, fencing tokens, expiration, owner evidence, and replayable lock events.
- [`@shapeshift-labs/frontier-kv-rate-limit`](https://www.npmjs.com/package/@shapeshift-labs/frontier-kv-rate-limit): Patch-native rate limit buckets for Frontier KV, including fixed windows, sliding windows, token buckets, deterministic refill, consume evidence, and reset records.
- [`@shapeshift-labs/frontier-kv-file`](https://www.npmjs.com/package/@shapeshift-labs/frontier-kv-file): Node file persistence adapter for Frontier KV snapshots and append-only JSONL event logs, including atomic writes, compaction, replay loading, and adapter evidence.
- [`@shapeshift-labs/frontier-kv-idb`](https://www.npmjs.com/package/@shapeshift-labs/frontier-kv-idb): IndexedDB persistence adapter for Frontier KV snapshots and event logs, with structural IDB interfaces, upgrade planning, compact event storage, and replay loading.
- [`@shapeshift-labs/frontier-kv-redis`](https://www.npmjs.com/package/@shapeshift-labs/frontier-kv-redis): Redis-compatible command planning and structural client adapter for Frontier KV operations, including key mapping, TTL commands, optimistic CAS scripts, and replay evidence without bundling Redis drivers.
- [`@shapeshift-labs/frontier-kv-server`](https://www.npmjs.com/package/@shapeshift-labs/frontier-kv-server): Small Node HTTP server adapter for Frontier KV, including request planning, JSON endpoints for get/set/delete/scan/batch, optional rate-limit hooks, and replayable response evidence.
- [`@shapeshift-labs/frontier-assets`](https://www.npmjs.com/package/@shapeshift-labs/frontier-assets): Serializable asset and content provenance graphs for Frontier apps, including source files, generated variants, thumbnails, LOD chunks, shader/material dependencies, transforms, hashes, owners, runtime consumers, review plans, registry graph output, and impact queries.
- [`@shapeshift-labs/frontier-blueprint`](https://www.npmjs.com/package/@shapeshift-labs/frontier-blueprint): Serializable Blueprint/Prefab flyweight templates for Frontier apps, including parameterized instantiation, deterministic ID/path remapping, compact overrides, variants, effective-state materialization, scene/state patch emission, dependency metadata, and registry graph output.
- [`@shapeshift-labs/frontier-triggers`](https://www.npmjs.com/package/@shapeshift-labs/frontier-triggers): Capability-gated event trigger registry, scoped event envelopes, listener/reaction rules, structured rejection, deterministic event-to-action scheduling, replay/provenance records, and registry graph output.
- [`@shapeshift-labs/frontier-virtual`](https://www.npmjs.com/package/@shapeshift-labs/frontier-virtual): DOM-neutral virtualization, layout providers, range materialization, grids, spatial/frustum indexes, patch invalidation, camera anchors, and serializable layout state.
- [`@shapeshift-labs/frontier-table`](https://www.npmjs.com/package/@shapeshift-labs/frontier-table): Renderer-neutral data grid and table primitives for Frontier apps, including stable row identity, sorting, filtering, selection, virtual ranges, patch-driven edits, cache/dataflow descriptors, and CRDT-compatible row and cell operation frames.
- [`@shapeshift-labs/frontier-scene`](https://www.npmjs.com/package/@shapeshift-labs/frontier-scene): Patch-native 2D/3D scene graph, transform propagation, bounds queries, virtual/culling adapters, spatial invalidation, and camera/frustum materialization.
- [`@shapeshift-labs/frontier-pathfinding`](https://www.npmjs.com/package/@shapeshift-labs/frontier-pathfinding): Patch-native grid pathfinding, typed-array A*/Dijkstra search, flow fields, connected components, line-of-sight smoothing, dirty-cell invalidation, and scheduler-friendly path jobs.
- [`@shapeshift-labs/frontier-lod`](https://www.npmjs.com/package/@shapeshift-labs/frontier-lod): Patch-native level-of-detail and significance selection for rendering and computation workloads, compact typed hot paths, multi-observer selection, budget degradation, materialization frames, and scheduler work plans.
- [`@shapeshift-labs/frontier-route`](https://www.npmjs.com/package/@shapeshift-labs/frontier-route): DOM-neutral app/game route resources, route and scene manifests, match/resolve/transition planning, dependency metadata, sessions, registry graph output, and impact queries.
- [`@shapeshift-labs/frontier-trace`](https://www.npmjs.com/package/@shapeshift-labs/frontier-trace): Serializable traces, spans, events, causal links, W3C trace context helpers, timeline/resource/path queries, critical-path analysis, registry graph output, JSONL/proof helpers, Chrome trace export, and redaction for app-wide feature observability.
- [`@shapeshift-labs/frontier-manifest`](https://www.npmjs.com/package/@shapeshift-labs/frontier-manifest): Build/static feature manifests for owners, routes, actions, states, migrations, tests, source files, assets, resources, tasks, dependency metadata, registry graph output, feature maps, JSONL export, and impact queries.
- [`@shapeshift-labs/frontier-view`](https://www.npmjs.com/package/@shapeshift-labs/frontier-view): Renderer-neutral view manifests, type defaults, validation frames, action bindings, visual channels, virtual/LOD hints, and data-to-representation mapping for Frontier apps.
- [`@shapeshift-labs/frontier-icons`](https://www.npmjs.com/package/@shapeshift-labs/frontier-icons): Renderer-neutral icon records, icon sets, lookup aliases, SVG frames, string rendering, and registry evidence for Frontier apps.
- [`@shapeshift-labs/frontier-design`](https://www.npmjs.com/package/@shapeshift-labs/frontier-design): Renderer-neutral design-system tokens, semantic roles, recipes, target style frames, CSS variable output, and registry graph evidence for Frontier apps.
- [`@shapeshift-labs/frontier-canvas`](https://www.npmjs.com/package/@shapeshift-labs/frontier-canvas): Renderer-neutral infinite canvas surfaces for Frontier apps, including camera and viewport math, pan/zoom plans, grid materialization, snapping, hit testing, selection handles, extensible tool dispatch, frame records, registry graph output, and impact/proof helpers.
- [`@shapeshift-labs/frontier-canvas-tools`](https://www.npmjs.com/package/@shapeshift-labs/frontier-canvas-tools): Renderer-neutral editor tools, state machines, transform handles, permissions, async records, and AI action bridges for Frontier canvas surfaces.
- [`@shapeshift-labs/frontier-dnd`](https://www.npmjs.com/package/@shapeshift-labs/frontier-dnd): Renderer-neutral drag-and-drop sessions, sensor descriptors, collision ranking, drop planning, reorder patches, state partitioning, and registry evidence for Frontier apps.
- [`@shapeshift-labs/frontier-dom`](https://www.npmjs.com/package/@shapeshift-labs/frontier-dom): Patch-native DOM and host renderer bindings, manifest hydration, JSX runtime/compiler helpers, SSR, devtools, and logging bridges.
- [`@shapeshift-labs/frontier-playwright`](https://www.npmjs.com/package/@shapeshift-labs/frontier-playwright): Playwright/headless automation probes for Frontier state, DOM, devtools, marks, and timeline queries.
- [`@shapeshift-labs/frontier-test`](https://www.npmjs.com/package/@shapeshift-labs/frontier-test): Serializable test/spec evidence manifests for Frontier apps, including fixtures, commands, expected patches/effects/routes/policies, coverage declarations, run plans, run records, report adapters, replay proofs, fuzzers, benchmarks, registry graph output, and impact queries.
- [`@shapeshift-labs/frontier-fixtures`](https://www.npmjs.com/package/@shapeshift-labs/frontier-fixtures): Deterministic fixture and scenario generation for Frontier apps, including schema-valid sample state, related entity collections, actor personas, route states, replay-verified patch streams, event records, JSONL bundles, and evidence summaries.
- [`@shapeshift-labs/frontier-component-preview`](https://www.npmjs.com/package/@shapeshift-labs/frontier-component-preview): Frontier-native component preview books, generated preview manifests, stateful variants, Vite virtual modules, standalone browser preview shells, inspector bridges, and preview harness evidence for Frontier apps.
- [`@shapeshift-labs/frontier-documentation`](https://www.npmjs.com/package/@shapeshift-labs/frontier-documentation): Frontier-native documentation manifests, generated documentation books, package/API/source discovery, Vite virtual modules, standalone browser docs shells, inspector bridges, search indexes, and documentation harness evidence for Frontier apps and packages.
- [`@shapeshift-labs/frontier-ast-walk`](https://www.npmjs.com/package/@shapeshift-labs/frontier-ast-walk): Dependency-light source graph, import/export/declaration/call analysis, Frontier package-use discovery, and business-logic placement findings for Frontier tools, apps, docs, fuzzers, benchmarks, and agent evidence.
- [`@shapeshift-labs/frontier-history`](https://www.npmjs.com/package/@shapeshift-labs/frontier-history): Serializable temporal explanation and causality records for Frontier apps, including field-change explanations, action/workflow/policy/effect/trace/test provenance, audit windows, undo planning, registry/provenance graph output, JSONL replay bundles, and proof hashes.
- [`@shapeshift-labs/frontier-application`](https://www.npmjs.com/package/@shapeshift-labs/frontier-application): Serializable whole-application graph and impact queries for Frontier apps, including features, owners, packages, routes, views, actions, mutations, state paths, effects, workers, assets, tests, traces, policies, workflows, migrations, benchmarks, registry graph output, feature maps, JSONL bundles, and proof hashes.
- [`@shapeshift-labs/frontier-linter`](https://www.npmjs.com/package/@shapeshift-labs/frontier-linter): Serializable Frontier lint rules, diagnostics, fixes, reports, and fast rule execution for package catalogs, registry graphs, application maps, manifests, traces, policies, workflows, workers, assets, tests, benchmarks, and source snippets.
- [`@shapeshift-labs/frontier-framework`](https://www.npmjs.com/package/@shapeshift-labs/frontier-framework): High-level app framework package for Frontier applications, including configuration, CLI scaffolding, Vite builds, monorepo layout, TSX route builds, split frontend/backend deploy artifacts, backend-neutral Fetch handler and sync transport contracts, runtime data-source migrations, devtools, harness gates, agent MCP/tool manifests, CI evidence gates, workflow manifests, SARIF/linter output, replay scripts, and evidence manifest output.
- [`@shapeshift-labs/frontier-crdt`](https://www.npmjs.com/package/@shapeshift-labs/frontier-crdt): Native CRDT documents, update tooling, awareness, branches, conflict introspection, version frames, and undo.
- [`@shapeshift-labs/frontier-crdt-sync`](https://www.npmjs.com/package/@shapeshift-labs/frontier-crdt-sync): CRDT sync endpoints, repo/storage/provider contracts, scheduled sync work, document URLs, local networks, model checking, forensics, and text binding contracts.
- [`@shapeshift-labs/frontier-crdt-websocket`](https://www.npmjs.com/package/@shapeshift-labs/frontier-crdt-websocket): WebSocket client/server transports for Frontier CRDT sync providers.
- [`@shapeshift-labs/frontier-react`](https://www.npmjs.com/package/@shapeshift-labs/frontier-react): React external-store hooks and adapters for Frontier state, cache, and CRDT surfaces.
- [`@shapeshift-labs/frontier-richtext`](https://www.npmjs.com/package/@shapeshift-labs/frontier-richtext): Rich text Delta normalization/application, marks, embeds, ranges, and cursor/selection transforms for local editor integrations.
- [`@shapeshift-labs/frontier-realtime`](https://www.npmjs.com/package/@shapeshift-labs/frontier-realtime): Shared realtime command, tick, snapshot, prediction, reconciliation, interpolation, rollback, message, and delta primitives.
- [`@shapeshift-labs/frontier-realtime-server`](https://www.npmjs.com/package/@shapeshift-labs/frontier-realtime-server): Authoritative realtime room, tick, command validation, rate-limit, session, and snapshot-history runtime.
- [`@shapeshift-labs/frontier-realtime-websocket`](https://www.npmjs.com/package/@shapeshift-labs/frontier-realtime-websocket): WebSocket client, wire, and Node room-server transport for Frontier realtime.
- [`@shapeshift-labs/frontier-game`](https://www.npmjs.com/package/@shapeshift-labs/frontier-game): Game-facing entity, component, player, room, ownership, spatial interest, rollback, physics, and replication helpers above realtime.
- [`@shapeshift-labs/loom`](https://www.npmjs.com/package/@shapeshift-labs/loom): Repo-level semantic collaboration CLI for .loom workspaces, including init, scan, status, graph snapshots, projection plans, Frontier Lang delegation, Frontier Swarm delegation, and Frontier Framework delegation.

Package source repositories:

- [`siliconjungle/-shapeshift-labs-frontier`](https://github.com/siliconjungle/-shapeshift-labs-frontier)
- [`siliconjungle/-shapeshift-labs-frontier-query`](https://github.com/siliconjungle/-shapeshift-labs-frontier-query)
- [`siliconjungle/-shapeshift-labs-frontier-codec`](https://github.com/siliconjungle/-shapeshift-labs-frontier-codec)
- [`siliconjungle/-shapeshift-labs-frontier-engine`](https://github.com/siliconjungle/-shapeshift-labs-frontier-engine)
- [`siliconjungle/-shapeshift-labs-frontier-state`](https://github.com/siliconjungle/-shapeshift-labs-frontier-state)
- [`siliconjungle/-shapeshift-labs-frontier-dataflow`](https://github.com/siliconjungle/-shapeshift-labs-frontier-dataflow)
- [`siliconjungle/-shapeshift-labs-frontier-state-cache`](https://github.com/siliconjungle/-shapeshift-labs-frontier-state-cache)
- [`siliconjungle/-shapeshift-labs-frontier-state-cache-idb`](https://github.com/siliconjungle/-shapeshift-labs-frontier-state-cache-idb)
- [`siliconjungle/-shapeshift-labs-frontier-state-cache-file`](https://github.com/siliconjungle/-shapeshift-labs-frontier-state-cache-file)
- [`siliconjungle/-shapeshift-labs-frontier-state-cache-sql`](https://github.com/siliconjungle/-shapeshift-labs-frontier-state-cache-sql)
- [`siliconjungle/-shapeshift-labs-frontier-schema`](https://github.com/siliconjungle/-shapeshift-labs-frontier-schema)
- [`siliconjungle/-shapeshift-labs-frontier-migrations`](https://github.com/siliconjungle/-shapeshift-labs-frontier-migrations)
- [`siliconjungle/-shapeshift-labs-frontier-event-log`](https://github.com/siliconjungle/-shapeshift-labs-frontier-event-log)
- [`siliconjungle/-shapeshift-labs-frontier-inspect`](https://github.com/siliconjungle/-shapeshift-labs-frontier-inspect)
- [`siliconjungle/-shapeshift-labs-frontier-scheduler`](https://github.com/siliconjungle/-shapeshift-labs-frontier-scheduler)
- [`siliconjungle/-shapeshift-labs-frontier-logging`](https://github.com/siliconjungle/-shapeshift-labs-frontier-logging)
- [`siliconjungle/-shapeshift-labs-frontier-mutation`](https://github.com/siliconjungle/-shapeshift-labs-frontier-mutation)
- [`siliconjungle/-shapeshift-labs-frontier-effects`](https://github.com/siliconjungle/-shapeshift-labs-frontier-effects)
- [`siliconjungle/-shapeshift-labs-frontier-auth`](https://github.com/siliconjungle/-shapeshift-labs-frontier-auth)
- [`siliconjungle/-shapeshift-labs-frontier-policy`](https://github.com/siliconjungle/-shapeshift-labs-frontier-policy)
- [`siliconjungle/-shapeshift-labs-frontier-flags`](https://github.com/siliconjungle/-shapeshift-labs-frontier-flags)
- [`siliconjungle/-shapeshift-labs-frontier-tools`](https://github.com/siliconjungle/-shapeshift-labs-frontier-tools)
- [`siliconjungle/-shapeshift-labs-frontier-sandbox`](https://github.com/siliconjungle/-shapeshift-labs-frontier-sandbox)
- [`siliconjungle/-shapeshift-labs-frontier-sandbox-quickjs`](https://github.com/siliconjungle/-shapeshift-labs-frontier-sandbox-quickjs)
- [`siliconjungle/-shapeshift-labs-frontier-workflow`](https://github.com/siliconjungle/-shapeshift-labs-frontier-workflow)
- [`siliconjungle/-shapeshift-labs-frontier-worker`](https://github.com/siliconjungle/-shapeshift-labs-frontier-worker)
- [`siliconjungle/-shapeshift-labs-frontier-queue`](https://github.com/siliconjungle/-shapeshift-labs-frontier-queue)
- [`siliconjungle/-shapeshift-labs-frontier-swarm`](https://github.com/siliconjungle/-shapeshift-labs-frontier-swarm)
- [`siliconjungle/-shapeshift-labs-frontier-swarm-codex`](https://github.com/siliconjungle/-shapeshift-labs-frontier-swarm-codex)
- [`siliconjungle/-shapeshift-labs-frontier-lang-kernel`](https://github.com/siliconjungle/-shapeshift-labs-frontier-lang-kernel)
- [`siliconjungle/-shapeshift-labs-frontier-lang-parser`](https://github.com/siliconjungle/-shapeshift-labs-frontier-lang-parser)
- [`siliconjungle/-shapeshift-labs-frontier-lang-checker`](https://github.com/siliconjungle/-shapeshift-labs-frontier-lang-checker)
- [`siliconjungle/-shapeshift-labs-frontier-lang-typescript`](https://github.com/siliconjungle/-shapeshift-labs-frontier-lang-typescript)
- [`siliconjungle/-shapeshift-labs-frontier-lang-javascript`](https://github.com/siliconjungle/-shapeshift-labs-frontier-lang-javascript)
- [`siliconjungle/-shapeshift-labs-frontier-lang-rust`](https://github.com/siliconjungle/-shapeshift-labs-frontier-lang-rust)
- [`siliconjungle/-shapeshift-labs-frontier-lang-python`](https://github.com/siliconjungle/-shapeshift-labs-frontier-lang-python)
- [`siliconjungle/-shapeshift-labs-frontier-lang-c`](https://github.com/siliconjungle/-shapeshift-labs-frontier-lang-c)
- [`siliconjungle/-shapeshift-labs-frontier-lang-compiler`](https://github.com/siliconjungle/-shapeshift-labs-frontier-lang-compiler)
- [`siliconjungle/-shapeshift-labs-frontier-lang-swift`](https://github.com/siliconjungle/-shapeshift-labs-frontier-lang-swift)
- [`siliconjungle/-shapeshift-labs-frontier-lang-kotlin`](https://github.com/siliconjungle/-shapeshift-labs-frontier-lang-kotlin)
- [`siliconjungle/-shapeshift-labs-frontier-lang-java`](https://github.com/siliconjungle/-shapeshift-labs-frontier-lang-java)
- [`siliconjungle/-shapeshift-labs-frontier-lang-go`](https://github.com/siliconjungle/-shapeshift-labs-frontier-lang-go)
- [`siliconjungle/-shapeshift-labs-frontier-lang-csharp`](https://github.com/siliconjungle/-shapeshift-labs-frontier-lang-csharp)
- [`siliconjungle/-shapeshift-labs-frontier-lang-clang`](https://github.com/siliconjungle/-shapeshift-labs-frontier-lang-clang)
- [`siliconjungle/-shapeshift-labs-frontier-lang-cli`](https://github.com/siliconjungle/-shapeshift-labs-frontier-lang-cli)
- [`siliconjungle/-shapeshift-labs-frontier-lang`](https://github.com/siliconjungle/-shapeshift-labs-frontier-lang)
- [`siliconjungle/-shapeshift-labs-frontier-kv`](https://github.com/siliconjungle/-shapeshift-labs-frontier-kv)
- [`siliconjungle/-shapeshift-labs-frontier-kv-locks`](https://github.com/siliconjungle/-shapeshift-labs-frontier-kv-locks)
- [`siliconjungle/-shapeshift-labs-frontier-kv-rate-limit`](https://github.com/siliconjungle/-shapeshift-labs-frontier-kv-rate-limit)
- [`siliconjungle/-shapeshift-labs-frontier-kv-file`](https://github.com/siliconjungle/-shapeshift-labs-frontier-kv-file)
- [`siliconjungle/-shapeshift-labs-frontier-kv-idb`](https://github.com/siliconjungle/-shapeshift-labs-frontier-kv-idb)
- [`siliconjungle/-shapeshift-labs-frontier-kv-redis`](https://github.com/siliconjungle/-shapeshift-labs-frontier-kv-redis)
- [`siliconjungle/-shapeshift-labs-frontier-kv-server`](https://github.com/siliconjungle/-shapeshift-labs-frontier-kv-server)
- [`siliconjungle/-shapeshift-labs-frontier-assets`](https://github.com/siliconjungle/-shapeshift-labs-frontier-assets)
- [`siliconjungle/-shapeshift-labs-frontier-blueprint`](https://github.com/siliconjungle/-shapeshift-labs-frontier-blueprint)
- [`siliconjungle/-shapeshift-labs-frontier-triggers`](https://github.com/siliconjungle/-shapeshift-labs-frontier-triggers)
- [`siliconjungle/-shapeshift-labs-frontier-virtual`](https://github.com/siliconjungle/-shapeshift-labs-frontier-virtual)
- [`siliconjungle/-shapeshift-labs-frontier-table`](https://github.com/siliconjungle/-shapeshift-labs-frontier-table)
- [`siliconjungle/-shapeshift-labs-frontier-scene`](https://github.com/siliconjungle/-shapeshift-labs-frontier-scene)
- [`siliconjungle/-shapeshift-labs-frontier-pathfinding`](https://github.com/siliconjungle/-shapeshift-labs-frontier-pathfinding)
- [`siliconjungle/-shapeshift-labs-frontier-lod`](https://github.com/siliconjungle/-shapeshift-labs-frontier-lod)
- [`siliconjungle/-shapeshift-labs-frontier-route`](https://github.com/siliconjungle/-shapeshift-labs-frontier-route)
- [`siliconjungle/-shapeshift-labs-frontier-trace`](https://github.com/siliconjungle/-shapeshift-labs-frontier-trace)
- [`siliconjungle/-shapeshift-labs-frontier-manifest`](https://github.com/siliconjungle/-shapeshift-labs-frontier-manifest)
- [`siliconjungle/-shapeshift-labs-frontier-view`](https://github.com/siliconjungle/-shapeshift-labs-frontier-view)
- [`siliconjungle/-shapeshift-labs-frontier-icons`](https://github.com/siliconjungle/-shapeshift-labs-frontier-icons)
- [`siliconjungle/-shapeshift-labs-frontier-design`](https://github.com/siliconjungle/-shapeshift-labs-frontier-design)
- [`siliconjungle/-shapeshift-labs-frontier-canvas`](https://github.com/siliconjungle/-shapeshift-labs-frontier-canvas)
- [`siliconjungle/-shapeshift-labs-frontier-canvas-tools`](https://github.com/siliconjungle/-shapeshift-labs-frontier-canvas-tools)
- [`siliconjungle/-shapeshift-labs-frontier-dnd`](https://github.com/siliconjungle/-shapeshift-labs-frontier-dnd)
- [`siliconjungle/-shapeshift-labs-frontier-dom`](https://github.com/siliconjungle/-shapeshift-labs-frontier-dom)
- [`siliconjungle/-shapeshift-labs-frontier-playwright`](https://github.com/siliconjungle/-shapeshift-labs-frontier-playwright)
- [`siliconjungle/-shapeshift-labs-frontier-test`](https://github.com/siliconjungle/-shapeshift-labs-frontier-test)
- [`siliconjungle/-shapeshift-labs-frontier-fixtures`](https://github.com/siliconjungle/-shapeshift-labs-frontier-fixtures)
- [`siliconjungle/-shapeshift-labs-frontier-component-preview`](https://github.com/siliconjungle/-shapeshift-labs-frontier-component-preview)
- [`siliconjungle/-shapeshift-labs-frontier-documentation`](https://github.com/siliconjungle/-shapeshift-labs-frontier-documentation)
- [`siliconjungle/-shapeshift-labs-frontier-ast-walk`](https://github.com/siliconjungle/-shapeshift-labs-frontier-ast-walk)
- [`siliconjungle/-shapeshift-labs-frontier-history`](https://github.com/siliconjungle/-shapeshift-labs-frontier-history)
- [`siliconjungle/-shapeshift-labs-frontier-application`](https://github.com/siliconjungle/-shapeshift-labs-frontier-application)
- [`siliconjungle/-shapeshift-labs-frontier-linter`](https://github.com/siliconjungle/-shapeshift-labs-frontier-linter)
- [`siliconjungle/-shapeshift-labs-frontier-framework`](https://github.com/siliconjungle/-shapeshift-labs-frontier-framework)
- [`siliconjungle/-shapeshift-labs-frontier-crdt`](https://github.com/siliconjungle/-shapeshift-labs-frontier-crdt)
- [`siliconjungle/-shapeshift-labs-frontier-crdt-sync`](https://github.com/siliconjungle/-shapeshift-labs-frontier-crdt-sync)
- [`siliconjungle/-shapeshift-labs-frontier-crdt-websocket`](https://github.com/siliconjungle/-shapeshift-labs-frontier-crdt-websocket)
- [`siliconjungle/-shapeshift-labs-frontier-react`](https://github.com/siliconjungle/-shapeshift-labs-frontier-react)
- [`siliconjungle/-shapeshift-labs-frontier-richtext`](https://github.com/siliconjungle/-shapeshift-labs-frontier-richtext)
- [`siliconjungle/-shapeshift-labs-frontier-realtime`](https://github.com/siliconjungle/-shapeshift-labs-frontier-realtime)
- [`siliconjungle/-shapeshift-labs-frontier-realtime-server`](https://github.com/siliconjungle/-shapeshift-labs-frontier-realtime-server)
- [`siliconjungle/-shapeshift-labs-frontier-realtime-websocket`](https://github.com/siliconjungle/-shapeshift-labs-frontier-realtime-websocket)
- [`siliconjungle/-shapeshift-labs-frontier-game`](https://github.com/siliconjungle/-shapeshift-labs-frontier-game)
- [`siliconjungle/-shapeshift-labs-loom`](https://github.com/siliconjungle/-shapeshift-labs-loom)

## Install

```sh
npm install @shapeshift-labs/frontier-scheduler
```

## Current Surface

```ts
import { createScheduler } from '@shapeshift-labs/frontier-scheduler';

const scheduler = createScheduler({
  lanes: [
    { id: 'action', priority: 3 },
    { id: 'render', priority: 2, maxQueued: 32, backpressure: 'replace-key' },
    { id: 'logging', priority: -1, maxQueued: 128, backpressure: 'drop-old' }
  ],
  framePolicy: 'manual'
});

scheduler.schedule({
  type: 'todo.toggle',
  lane: 'action',
  key: 'todo:a',
  input: { id: 'a' },
  run(ctx) {
    ctx.metadata.started = true;
  }
});

const result = scheduler.run({ maxUnits: 16 });
const graph = scheduler.inspect();
const replay = scheduler.serialize();
const metrics = scheduler.metrics();
```

`serialize()` stores the deterministic pending queue and recent records. `deserializeSchedulerState(snapshot, { handlers })` recreates queued work when each task has a serializable `type` and a registered handler.

Renderers, mutation registries, virtual layout, persistence, logging, and game loops can consume this scheduler structurally. They do not need to import this package unless they want the default implementation.

## Swarm Dashboard Metrics

`scheduler.metrics()` summarizes each lane from scheduler history plus the live queue. Each lane reports active, queued, completed, failed, cancelled, and dropped counts, total runtime milliseconds, completed/failed runtime totals, total units, configured `maxQueued`, and a numeric pressure value. Bounded lanes use `queued / maxQueued`; unbounded lanes use `queued / max(1, active)`.

Agent runners that already have structural task records can use the pure helper without owning a scheduler instance:

```ts
import { summarizeSchedulerThroughput } from '@shapeshift-labs/frontier-scheduler';

const dashboard = summarizeSchedulerThroughput(records, {
  now: performance.now(),
  lanes: [
    { id: 'research', maxQueued: 16 },
    { id: 'implementation', maxQueued: 8 }
  ],
  activeByLane: { implementation: 4 },
  queuedByLane: { implementation: 7 }
});
```

Swarm coordinators can scale lanes with sustained pressure near or above `1`, rising failed or dropped counts, or high queued counts. Healthy lanes should show completed work, low or zero queue pressure, and stable failed/runtime totals.

## Continuous Pool Capacity

`summarizeContinuousWorkerPoolCapacity()` is a smaller pure helper for continuous worker pools, agent runners, and other lease-backed executors. It answers a different question than throughput metrics: "how many workers should I refill next, and is the pool wasting or idling capacity?"

```ts
import { summarizeContinuousWorkerPoolCapacity } from '@shapeshift-labs/frontier-scheduler';

const capacity = summarizeContinuousWorkerPoolCapacity({
  desiredConcurrency: 8,
  activeCount: 5,
  leaseCount: 1,
  queuedCount: 12,
  reservedCount: 1
});

// capacity.launchableCount === 1
// capacity.nextRefillCount === 1
// capacity.backpressureReason === 'refill-needed'
```

- `availableCount` reports raw headroom before reservations.
- `reservedCount` lets callers keep launch capacity available for review drain, reruns, or other non-speculative work.
- `launchableCount` is the refill budget after reservations are applied.
- `nextRefillCount` tells you how many workers to start from that launchable budget while queued work exists.
- `backpressureReason` distinguishes between `refill-needed`, `at-capacity`, and `oversubscribed`.
- `isIdle` flags spare pool capacity when no work is queued and no launch reservation is pending.
- `isWaste` flags over-lease or over-active capacity above the desired concurrency.

This keeps a continuous agent pool full when there is work, but avoids starting extra workers when the queue is empty or the pool is already saturated.

## Continuous Pool Capacity State

`summarizeContinuousWorkerPoolCapacityState()` is the more explicit helper when you need to show where a pool is currently occupied instead of only whether it can refill. It keeps `active`, `queued`, `review-drain`, `rerun`, `conflict`, `human-question`, and residual `drained` capacity separate.

```ts
import { summarizeContinuousWorkerPoolCapacityState } from '@shapeshift-labs/frontier-scheduler';

const state = summarizeContinuousWorkerPoolCapacityState({
  desiredConcurrency: 8,
  activeCount: 2,
  queuedCount: 1,
  reviewDrainCount: 2,
  rerunCount: 1,
  conflictCount: 1,
  humanQuestionCount: 1
});

// state.occupiedCount === 8
// state.drainedCount === 0
// state.isBlocked === true
```

- `stateCounts` keeps the per-bucket breakdown, including the residual `drained` bucket.
- `overflowCount` shows how much the named buckets exceed `desiredConcurrency`.
- `isBlocked` flags conflict or human-question pressure even when there is still spare capacity.
- `isDrained` stays true only when none of the named buckets occupy the pool.

## Continuous Refill Planning

`createContinuousWorkerPoolRefillPlan()` turns idle slots into a deterministic refill order. It prefers local drain queues first, then implementation backlog, so a parent coordinator can refill from already-draining work before opening fresh speculative work.

```ts
import { createContinuousWorkerPoolRefillPlan } from '@shapeshift-labs/frontier-scheduler';

const plan = createContinuousWorkerPoolRefillPlan({
  maxWorkers: 4,
  activeCount: 1,
  drainQueues: [
    { id: 'review-drain', priority: 'high', items: [{ id: 'review-a' }] },
    { id: 'rerun', priority: 'normal', items: [{ id: 'rerun-a' }] }
  ],
  implementationBacklog: [{ id: 'impl-a' }]
});

// plan.idleSlotCount === 3
// plan.recommendations.map((entry) => entry.itemId) === ['review-a', 'rerun-a', 'impl-a']
```

- `drainQueues` keep the queue hierarchy intact, so higher-priority local drain queues fill first.
- `implementationBacklog` only starts filling after the drain queues have been consumed.
- `slots` and `recommendations` stay aligned, making it easy to present an idle-slot plan or to execute it directly.

## Adaptive Target Feedback

`summarizeContinuousWorkerPoolTargetFeedback()` turns useful output, CPU pressure, and review debt into a bounded concurrency target. The default band is `5..10`, which keeps the pool from collapsing too far when output is weak and prevents runaway growth when pressure or review debt rises.

```ts
import { recommendContinuousWorkerPoolTarget } from '@shapeshift-labs/frontier-scheduler';

const target = recommendContinuousWorkerPoolTarget({
  usefulOutputCount: 16,
  cpuPressure: 0,
  reviewDebt: 0
});

// target === 10
```

- `usefulOutputCount` raises the target as recent work keeps producing useful output.
- `cpuPressure` lowers the target when the pool is already under load.
- `reviewDebt` lowers the target when coordinator review still needs draining.
- `minTarget` and `maxTarget` let callers keep the same feedback loop while tightening or widening the allowed band.

## Lease-Aware Pool Capacity

`summarizeLeaseAwarePoolCapacity()` is a small pure helper for leased agent pools, review queues, and coordinator dashboards. It distinguishes active leases from stale leases, plus queued work, review/repair/rerun/apply drain pressure, and separate blocked-human reporting.

```ts
import { summarizeLeaseAwarePoolCapacity } from '@shapeshift-labs/frontier-scheduler';

const capacity = summarizeLeaseAwarePoolCapacity({
  targetConcurrency: 4,
  now: 100,
  heartbeatGraceMs: 25,
  leases: [
    { expiresAt: 150 },
    { expiresAt: 120 },
    { expiresAt: 80 }
  ],
  queuedCount: 2,
  reviewCount: 1,
  repairCount: 1,
  rerunCount: 1,
  applyCount: 1,
  blockedHumanCount: 1
});

// capacity.activeCount === 2
// capacity.staleLeaseCount === 1
// capacity.reviewDrainPressure === 4
// capacity.reservedCount === 5
// capacity.launchableCount === 0
// capacity.suggestedRefillCount === 0
```

- `activeCount` counts leases that have not expired yet, plus any leases still inside the heartbeat grace window.
- `heartbeatGraceMs` keeps leases in the active bucket for a short lag window when remote heartbeats arrive late.
- `staleLeaseCount` counts leases whose `expiresAt` is at or before `now - heartbeatGraceMs`.
- `reviewCount`, `repairCount`, `rerunCount`, and `applyCount` stay separate so coordinators can report each drain bucket independently.
- `reviewDrainPressure` combines review work, missing-patch repair, reruns, and coordinator apply work into a single drain signal.
- `reservedCount` adds stale leases to that drain signal so speculative launches keep capacity in reserve.
- `launchableCount` is the remaining refill budget after reservations.
- `suggestedRefillCount` is capped by remaining launchable capacity, so review-drain reservations reduce speculative worker launches.
- `blockedHumanCount` is reported separately and does not reduce launchable capacity.

If you need gate execution split out from speculative backlog, use `summarizeCoordinatorGateRunCapacity()`.

## Local Queue Concurrency Caps

`summarizeLocalQueueConcurrencyCaps()` is a pure helper for local merge queues and coordinator dashboards. It treats each semantic scope as having one apply leader slot, so a busy scope keeps its own overflow queued while unrelated scopes still get a launch opportunity.

```ts
import { summarizeLocalQueueConcurrencyCaps } from '@shapeshift-labs/frontier-scheduler';

const caps = summarizeLocalQueueConcurrencyCaps({
  scopes: [
    { id: 'scope:a', activeCount: 1, queuedCount: 3 },
    { id: 'scope:b', activeCount: 0, queuedCount: 2 }
  ]
});

// caps.launchableCount === 1
// caps.byScope['scope:b'].launchableCount === 1
// caps.byScope['scope:a'].blockedCount === 3
```

- `activeCount` counts the currently running local leaders for that scope.
- `queuedCount` counts the same-scope work waiting behind the leader cap.
- `launchableCount` is `1` when a scope has queued work but no active leader, so a different semantic scope can still progress.
- `blockedCount` reports same-scope overflow that must remain queued locally.
- `oversubscribedScopeCount` highlights scopes that already have more than one active leader and should be tightened up.

## Coordinator Gate Run Capacity

`summarizeCoordinatorGateRunCapacity()` is a coordinator-focused helper for gate-run pools. It keeps active workers separate from gate execution, apply/repair/rerun drain, speculative backlog, and true human blockers so review/apply work can reserve capacity before new speculative launches start.

```ts
import { summarizeCoordinatorGateRunCapacity } from '@shapeshift-labs/frontier-scheduler';

const capacity = summarizeCoordinatorGateRunCapacity({
  targetConcurrency: 10,
  activeCount: 4,
  gateRunCount: 2,
  applyCount: 1,
  repairCount: 1,
  rerunCount: 1,
  speculativeBacklogCount: 6,
  blockedHumanCount: 2,
  heartbeatGraceMs: 25,
  staleLeaseCount: 1
});

// capacity.activeCount === 4
// capacity.gateRunCount === 2
// capacity.gateDrainPressure === 5
// capacity.reservedCount === 6
// capacity.launchableCount === 0
// capacity.suggestedRefillCount === 0
```

- `gateRunCount`, `applyCount`, `repairCount`, and `rerunCount` stay separate so coordinators can report each drain bucket independently.
- `gateDrainPressure` combines gate execution, apply work, repair, and reruns into a single reserve signal.
- `heartbeatGraceMs` keeps remote workers in the active bucket for a short lag window before they become stale.
- `reservedCount` adds stale leases to that drain signal so speculative launches keep capacity in reserve.
- `speculativeBacklogCount` is reported separately and only feeds `suggestedRefillCount` after drain reservations are applied.
- `blockedHumanCount` is reported separately and does not reduce launchable capacity.
- `suggestedRefillCount` is the refill budget after review/apply drain reservations are satisfied.

## Model-Aware Pool Capacity

`summarizeModelAwarePoolCapacity()` extends the same capacity math to model-aware pools with multiple tiers such as `fast`, `standard`, and `deep`. It reports per-tier open slots, the remaining model budget, remaining escalation budget, expensive-tier saturation, and whether the scheduler should backpressure or downgrade to a cheaper tier.

```ts
import { summarizeModelAwarePoolCapacity } from '@shapeshift-labs/frontier-scheduler';

const capacity = summarizeModelAwarePoolCapacity({
  budgetRemaining: 120,
  escalationBudgetRemaining: 18,
  expensiveTierId: 'deep',
  tiers: [
    { id: 'fast', desiredConcurrency: 4, activeCount: 2, leaseCount: 1, queuedCount: 6 },
    { id: 'standard', desiredConcurrency: 3, activeCount: 3, queuedCount: 1 },
    { id: 'deep', desiredConcurrency: 2, activeCount: 2, queuedCount: 2 }
  ]
});

// capacity.openSlotsByTier.fast === 1
// capacity.expensiveTierSaturation === 2
// capacity.downgradeAdvice === 'downgrade'
```

- `openSlotsByTier` shows spare concurrency for each tier in the pool.
- `budgetRemaining` and `escalationBudgetRemaining` let coordinators stop expensive routing before the pool overspends.
- `expensiveTierSaturation` highlights how full the costly tier is, including queued work.
- `backpressureReason` distinguishes `budget-exhausted`, `escalation-budget-exhausted`, `expensive-tier-saturated`, `at-capacity`, and `refill-needed`.
- `downgradeAdvice` tells coordinators when to shift work to a cheaper tier versus applying backpressure.

`summarizeModelAwarePoolSlotAllocation()` turns that capacity summary into a slot plan. It fills cheaper tiers first and only spends expensive-tier slots when the budget and escalation budget are still healthy.

```ts
import { summarizeModelAwarePoolSlotAllocation } from '@shapeshift-labs/frontier-scheduler';

const allocation = summarizeModelAwarePoolSlotAllocation({
  requestedSlots: 4,
  budgetRemaining: 120,
  escalationBudgetRemaining: 18,
  expensiveTierId: 'deep',
  tiers: [
    { id: 'fast', desiredConcurrency: 2, activeCount: 1 },
    { id: 'standard', desiredConcurrency: 3, activeCount: 1 },
    { id: 'deep', desiredConcurrency: 4, activeCount: 2 }
  ]
});

// allocation.allocationByTier.fast === 1
// allocation.allocationByTier.standard === 2
// allocation.allocationByTier.deep === 1
// allocation.expensiveTierAllocatedSlots === 1
```

- `allocationByTier` gives the requested slot count per tier after budget pressure is applied.
- `deferredSlots` reports how many requested slots could not be placed.
- `expensiveTierAllocatedSlots` makes the expensive-tier share explicit for routing dashboards.
- `backpressureReason` and `downgradeAdvice` are forwarded from the capacity summary so the caller can react consistently.
- If the expensive tier is absent from the input capacity snapshot, the allocation summary still includes it with zero open and allocated slots so routing dashboards can show the budget boundary explicitly.

## Features

- deterministic lanes with lane priority, task priority, and stable FIFO ordering within equal priority
- cancellation by task or lane
- backpressure policies: `queue`, `drop-new`, `drop-old`, `cancel-old`, `replace-key`, `coalesce-key`, and `throw`
- frame policies: manual, microtask, animation frame, idle callback, and timeout
- queued typed tasks with handler-based replay
- JSON snapshots for pending work and optional history
- `inspect()` work graphs for lanes, queued tasks, completed records, causes, parent/child work, dependencies, and task keys
- `metrics()`, `summarizeSchedulerThroughput()`, `summarizeContinuousWorkerPoolCapacity()`, `createContinuousWorkerPoolRefillPlan()`, `summarizeContinuousWorkerPoolTargetFeedback()`, `recommendContinuousWorkerPoolTarget()`, `summarizeLocalQueueConcurrencyCaps()`, `summarizeLeaseAwarePoolCapacity()`, `summarizeCoordinatorGateRunCapacity()`, `summarizeModelAwarePoolCapacity()`, and `summarizeModelAwarePoolSlotAllocation()` for lane throughput, runtime totals, queue pressure, refill planning, local leader caps, adaptive target feedback, and continuous/model-aware pool capacity dashboards

## Benchmarks

These are Frontier-only package measurements, not competitor comparisons.

Run package-local measurements:

```sh
npm run bench
```

Latest local package benchmark on Node v26.1.0, darwin arm64, 80 iterations:

| Fixture | Mean | Median | p95 |
| --- | ---: | ---: | ---: |
| `schedule-run-1k` | 2.61 ms | 2.01 ms | 6.42 ms |
| `serialize-restore-1k` | 3.68 ms | 2.67 ms | 7.99 ms |
| `inspect-graph-1k` | 1.99 ms | 1.42 ms | 5.27 ms |
