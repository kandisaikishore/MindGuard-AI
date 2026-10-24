# Scalability baseline

Scale the application based on measured demand, product risk, and real workflows. Do not add distributed infrastructure without profiling evidence.

## Priorities
- Profile high-volume workflows and identify the actual bottleneck before adding replicas.
- Bound request sizes, concurrency, background work, retry counts, database pools, and external provider timeouts.
- Paginate large lists and optimize measured database query paths.
- Keep shared state outside individual service instances before enabling horizontal scaling.
- Protect tenant/user data with server-side authorization and test cross-user access boundaries.
- Add health/readiness checks, structured logs, request IDs, metrics, graceful shutdown, and documented rollback procedures where applicable.
- Protect secrets and personal data; keep sensitive content out of logs and metrics.
- Add automated build, unit, integration, security/dependency, and deployment smoke checks suited to the current stack.

## Load validation
Test normal, peak, burst, and degraded-dependency scenarios using representative data. Track throughput, p95/p99 latency, error rate, CPU/memory, database wait time, queue lag, and cost where relevant.

## Release gates
- [ ] Access controls and data isolation are tested.
- [ ] Failure handling and retry behavior are bounded and predictable.
- [ ] Data migrations, backup/restore, and rollback are validated where persistence exists.
- [ ] Capacity assumptions and measured load-test results are recorded.

This checklist is a plan, not evidence of completed load tests or production scaling.