# Pattern Library — Navigation, Sheets, Dialogs & Surfaces

Status: ACTIVE KNOWLEDGE PACK

## Hierarchy

Choose surface by task depth: inline expansion for local detail; bottom sheet for short contextual choice; dialog for bounded confirmation; full screen for complex durable task. Avoid multiple competing implementations.

## Back semantics

System back closes the topmost transient surface first, then navigates history, then exits only when appropriate. Predictive back should visually match the operation.

## Ownership

One canonical navigation/dialog manager. Feature code requests a surface; it does not invent a second modal framework.

## Failure checks

Nested modal traps; invisible backdrop intercepting taps; back exiting app; RTL edge mismatch; sheet behind keyboard; focus not returned to invoking control.
