# Plans

Use lightweight notes in the conversation for small, single-area changes. Create
a checked-in execution plan when work spans multiple source areas, changes data
schemas, changes deployment behavior, or needs several validation passes.

## Location

- Active plans: `docs/exec-plans/active/`
- Completed plans: `docs/exec-plans/completed/`

Use a descriptive kebab-case filename, for example:

```text
docs/exec-plans/active/add-boba-chain.md
```

## Plan Template

```md
# Title

## Goal

## Current State

## Steps

## Validation

## Decisions

## Completion Notes
```

Keep plans current while working. When the work is done, move the plan to
`docs/exec-plans/completed/` and record the validation commands that actually
ran.
