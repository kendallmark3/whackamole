# Capture Reusable Engineering Pattern

Review the engineering work performed during the current feature.

Determine whether anything we just did represents a reusable engineering pattern.

A reusable pattern should:

- solve a problem likely to occur again
- have identifiable inputs
- have identifiable outputs
- follow a repeatable procedure
- contain meaningful validation
- have a clear stop condition

If no meaningful reusable pattern exists, return:

NO AUTOMATION REQUIRED

If a reusable pattern exists:

1. Search the current automation folder for an existing related workflow.
2. Prefer updating an existing workflow over creating a duplicate.
3. Generalize the solution.
4. Remove feature-specific values that are not required.
5. Preserve important architectural constraints.
6. Define required inputs.
7. Define expected outputs.
8. Define the repeatable procedure.
9. Define validation.
10. Define a stop condition.
11. Save the result as a Markdown file under automation/.
12. Update automation/README.md.

Use this structure:

## Purpose

## When to Use

## Inputs

## Procedure

## Outputs

## Validation

## Stop Condition

Do not modify application code while capturing the reusable pattern.
