# KINGDOM_FACTION_UI

## Direction
**Royal Strategy**, relationship-first and event-first.

## Current contract
Factions expose goals, leaders, members, resources, alliances, enemies, territory and reputation. World state additionally exposes kingdoms, politics, economy, wars, laws, resources and activeEvents.

## Overview
Header: faction/kingdom identity + one concise state sentence.
Then:
- active conflict/critical event
- relationship strip (allies / neutral if explicit / enemies)
- territory summary
- resources/economy only when meaningful
- leadership
- goals

## Diplomacy
Use labeled relationship rows and explicit agreement/conflict terms. Avoid unreadable spider charts. Reputation values may be displayed only when their scale/meaning is known.

## Political/strategic view
Prefer event timeline + region/faction drill-down over a wall of KPI cards. Charts are allowed only when they answer a decision question.

## Economy
Currency/resource names always accompany values. Delta indicators require actual previous/current values. Never show invented trend arrows.

## Mobile
Single-column summary -> bottom sheets for diplomacy/resources. Wide screens may use split pane. RTL ordering must preserve semantic relationships.
