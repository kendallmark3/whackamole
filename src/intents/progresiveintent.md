# Universal Repository Improvement Intent

## Purpose

Use this single intent file to analyze, improve, modernize, stabilize, or refactor an existing software repository.

This file is intentionally runner-neutral. It may be executed by Claude Code, GitHub Copilot, Cursor, or another capable coding agent that can inspect the repository, reason about the codebase, modify files, run commands, and validate results.

The goal is not to impose a large agent architecture on the repository. The goal is to give the runner enough intent, boundaries, and success criteria to make the repository materially better.

---

# 1. INTENT

Improve this repository while preserving the parts of the application that are already valuable.

Determine what should stay, what should change, what should be removed, and what should be added.

Work from evidence found in the repository.

Prefer the smallest set of changes that produces the largest improvement in:

- correctness
- maintainability
- reliability
- usability
- testability
- security
- performance
- developer experience
- architectural clarity

Do not modernize for the sake of modernization.

Do not replace working code simply because a newer pattern exists.

Do not introduce unnecessary infrastructure, frameworks, services, agents, abstractions, or dependencies.

---

# 2. OPERATING MODE

Default to goal-based reasoning.

The desired outcome is:

> Make this repository meaningfully better without losing the behavior, business value, or useful design that already exists.

You may determine the implementation path.

Use procedural steps only where sequencing is required for safety or correctness.

Use parallel analysis only when independent areas can genuinely be evaluated independently.

Do not create subagents, skills, hooks, orchestration frameworks, or supporting infrastructure unless the repository clearly needs them to satisfy the intent.

The runner itself is the execution engine.

---

# 3. STARTING QUESTIONS

Before making substantial changes, determine whether the answers to the following questions are already available from the repository.

If they are obvious from the code, documentation, tests, issues, or configuration, do not ask the user.

Only ask questions whose answers would materially change the work.

Ask no more than 5 questions at once.

Potential questions:

1. What parts of this application do you consider most valuable or important to preserve?
2. What problems are you currently experiencing?
3. Is there another application, scaffold, framework, repository, or architecture that represents the direction you want?
4. Are there technologies, dependencies, platforms, or architectural decisions that must remain?
5. Are there areas you explicitly do not want changed?
6. Is the goal primarily bug fixing, modernization, cleanup, architecture improvement, performance, security, testing, developer experience, feature readiness, or full repository improvement?
7. Should changes be recommendation only, plan only, implemented after approval, or implemented automatically?
8. Are there constraints around time, compatibility, infrastructure, deployment, budget, or team skills?

If the user has no strong answers, proceed goal-first and make evidence-based recommendations.

---

# 4. REPOSITORY DISCOVERY

Inspect the repository before proposing major changes.

Build a concise understanding of:

## Application
- application purpose
- primary users
- major business capabilities
- main workflows
- entry points
- runtime behavior

## Technology
- languages
- frameworks
- package managers
- build system
- runtime
- deployment model
- infrastructure
- databases
- external integrations
- APIs
- messaging
- background jobs
- authentication
- configuration

## Structure
- major directories
- architectural layers
- services
- modules
- shared libraries
- duplicated code
- coupling
- dependency direction

## Quality
- tests
- linting
- static analysis
- code coverage
- error handling
- logging
- security controls
- performance concerns
- dead code
- stale dependencies
- TODOs
- FIXME markers
- obvious defects

## Delivery
- local development process
- build commands
- test commands
- CI/CD
- environment configuration
- deployment configuration

Do not rely only on filenames. Read representative implementation code. Trace important execution paths.

---

# 5. OPTIONAL REFERENCE SCAFFOLD

A reference scaffold is optional.

If a reference repository, scaffold, design system, architecture, or example application is supplied:

1. understand why it is considered representative
2. identify the characteristics worth adopting
3. do not blindly copy its structure
4. compare it against the current repository
5. adopt only changes that improve the current application

Use the reference as evidence, not as a mandatory target.

If no reference exists, infer an appropriate target architecture from the repository's purpose, current technology, constraints, maintainability, common engineering practices, and the minimum architecture required to meet the intent.

---

# 6. ANALYSIS OUTPUT

Before implementation, produce a concise repository assessment:

## Repository Assessment

### What the application does
A short explanation.

### What is working well
Identify valuable code, design, workflows, architecture, tests, or patterns worth preserving.

### Primary problems
Rank the most important problems as Critical, High, Medium, or Low.

### Root causes
Do not stop at symptoms. Identify why the problems exist.

### Recommended target state
Describe what the repository should look like after improvement.

### Keep / Change / Remove / Add
Provide four short lists.

### Highest-value improvements
Rank changes by:
1. user/business impact
2. defect reduction
3. engineering leverage
4. risk
5. implementation effort

### Proposed implementation sequence
Recommend the smallest sensible sequence of work.

---

# 7. CHANGE STRATEGY

Prefer improvement over replacement.

Use this order of preference:

1. fix
2. simplify
3. consolidate
4. refactor
5. isolate
6. replace only when justified

Preserve:
- business behavior
- working user flows
- stable interfaces
- valuable domain logic
- compatibility requirements

Avoid:
- speculative abstractions
- unnecessary microservices
- unnecessary distributed systems
- unnecessary agent frameworks
- unnecessary rewrites
- technology changes without measurable benefit
- large dependency additions for small problems

---

# 8. IMPLEMENTATION MODES

## MODE A — ANALYZE ONLY
Do not modify files. Return assessment, prioritized recommendations, target architecture, implementation plan, risks, and expected impact.

## MODE B — PLAN
Create a detailed implementation plan but do not modify application code. Identify files likely to change, changes by area, dependencies, order of work, validation strategy, and rollback considerations.

## MODE C — APPROVAL GATE
Analyze first. Present the plan. Wait for user approval before modifying files.

## MODE D — EXECUTE
Analyze, plan, implement, validate, and summarize.

If the user says things such as "do it", "fix it", "improve it", "implement it", "make the repo better", or "proceed", MODE D may be used unless repository risk indicates that approval should be requested first.

---

# 9. SAFE EXECUTION RULES

Before editing:
- understand the relevant code path
- inspect existing tests
- identify compatibility concerns
- identify configuration and environment dependencies

During editing:
- make coherent changes
- keep change groups conceptually small
- preserve public contracts unless change is justified
- avoid unrelated cleanup
- update tests with behavior changes
- update documentation when developer behavior changes

Never:
- remove secrets protection
- expose credentials
- weaken authentication
- disable security checks simply to make tests pass
- delete data
- perform destructive migrations without explicit approval
- overwrite unknown user work without understanding it

---

# 10. VALIDATION LOOP

After changes, validate the repository using the strongest validation available.

Examples:
- build
- compile
- lint
- type check
- unit tests
- integration tests
- end-to-end tests
- security checks
- dependency checks
- smoke tests
- application startup
- API checks
- UI checks

Use this loop:

PLAN → CHANGE → BUILD → TEST → OBSERVE → FIX → REPEAT UNTIL ACCEPTABLE

Do not claim success if validation failed.

If something cannot be validated, say exactly what remains unverified.

---

# 11. DEFECT HANDLING

If defects are discovered while implementing, fix them when:
- they are directly related to the work
- the fix is low risk
- the correct behavior is reasonably clear

Otherwise document them separately.

Do not allow a narrow task to turn into an uncontrolled rewrite.

---

# 12. ARCHITECTURE REVIEW

Evaluate whether the architecture matches the actual needs of the application.

Consider:
- boundaries
- coupling
- cohesion
- dependency direction
- service ownership
- state management
- API design
- persistence
- background processing
- integration points
- scalability
- resilience
- deployment complexity

Recommend the least architecture necessary.

A monolith that is clean and well-structured may be better than unnecessary microservices.

A service decomposition should only be recommended when independent ownership, scaling, deployment, isolation, or domain boundaries justify it.

---

# 13. MODERNIZATION REVIEW

When the repository is legacy, classify potential modernization into three categories.

## Keep
Stable technologies or patterns that still perform their job well.

## Improve
Areas where incremental modernization provides meaningful benefit.

## Replace
Components that are unsupported, dangerous, structurally limiting, or disproportionately expensive to maintain.

Do not equate "old" with "bad."

---

# 14. TESTING REVIEW

Assess whether the tests protect the important behavior.

Do not optimize only for a coverage percentage.

Prioritize coverage of:
- critical business logic
- failure conditions
- boundary conditions
- integrations
- security-sensitive behavior
- regression-prone code
- frequently changed areas

Where practical, add tests before or alongside risky refactoring.

---

# 15. SECURITY REVIEW

Look for high-value security issues including:
- hard-coded secrets
- unsafe configuration
- weak authentication or authorization
- insecure dependency usage
- injection risks
- unsafe deserialization
- sensitive logging
- insecure transport assumptions
- missing validation
- dangerous file handling
- overly broad permissions

Do not perform a fake exhaustive security audit.

Clearly distinguish identified issues from areas that were not evaluated.

---

# 16. DEVELOPER EXPERIENCE REVIEW

Look for improvements that make the repository easier for the next developer to use.

Examples:
- clear README
- simple setup
- predictable commands
- useful scripts
- understandable environment configuration
- documented architecture
- consistent patterns
- useful error messages
- removal of unnecessary setup steps

A successful repository should become easier to understand after this work.

---

# 17. SUCCESS CRITERIA

The work is successful when the repository is measurably better and the improvement is supported by evidence.

At minimum:
- the application still performs its important functions
- known high-value defects addressed by the work are fixed or documented
- changed code builds or runs where validation is available
- relevant tests pass
- unnecessary complexity has not increased
- architecture is clearer or no worse than before
- developer usability is improved or preserved
- significant risks are documented
- the final result is understandable to another developer

---

# 18. STOP CONDITIONS

Stop and ask before continuing when:
- the correct behavior cannot be inferred
- a destructive data change may be required
- an external contract may be broken
- credentials or production access are required
- a large architectural rewrite appears necessary
- multiple mutually exclusive product directions are equally plausible
- the requested change conflicts with repository constraints

Otherwise continue autonomously.

---

# 19. FINAL OUTPUT

At completion, return:

## What I Found
Short summary of the repository state.

## What I Changed
List the meaningful changes.

## Why
Explain the reasoning in business and engineering terms.

## Validation
Show commands run, tests run, results, failures, and unresolved validation.

## Remaining Issues
Prioritized list.

## Recommended Next Move
Give the single highest-value next action.

## Repository Delta
Summarize the difference between before and after.

---

# 20. CORE PRINCIPLE

Structure the boundary, not the reasoning.

This intent defines:
- the goal
- the available evidence
- the operating boundaries
- the success criteria
- the validation requirements
- the stop conditions

The runner determines the best reasoning path inside those boundaries.

Use the least architecture necessary to produce a trustworthy result.
