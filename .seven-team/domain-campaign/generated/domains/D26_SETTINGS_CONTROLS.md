# D26_SETTINGS_CONTROLS — Settings / Model Controls / Progressive Disclosure

Research audit: READY

DOMAIN_ID=D26_SETTINGS_CONTROLS
SOURCE_ANALYSIS=Sources: Android Core App Quality (release bar) and ChatGPT release notes (reference for model controls UX). Harvested evidence is metadata-only; no detailed controls spec captured. [SOURCE primary] https://developer.android.com/docs/quality-guidelines/core-app-quality ; [SOURCE primary] https://help.openai.com/en/articles/6825453-chatgpt-release-notes
CURRENT=Settings/model controls exist in CSS (seven-shell-model-chip, mode menus). Progressive disclosure present via menus. No evidence of deterministic timeout/cancellation behavior or dead-request handling. A05 owns runtime/model controls; A01 owns UI surface.
TARGET=Settings/model controls with progressive disclosure, deterministic timeout/cancellation, no dead requests, clear status indicators, accessible focus states.
NOW=Audit settings surface for control density, disclosure patterns, and status feedback; document gaps; coordinate with A05 runtime.
NEXT=Add deterministic timeout/cancellation evidence; unload warnings; stale-tab behavior; durable status indicator.
LATER=Advanced controls behind progressive disclosure; per-model capability display; approval binding for high-impact actions.
TESTS=Settings golden screen; cancellation tests; stale-tab behavior; accessibility focus; model routing smoke.
RISKS=Duplicate control surfaces; runtime/store duplication; security: no sensitive action without real grant; credential exposure.
FIRST_SLICE=Settings surface audit + gap list + coordination with A05; no production edits.
KNOWN_UNKNOWNS=No runtime timeout evidence; no browser regression; no Android settings evidence.
DOMAIN_VERDICT=READY_FOR_PLAN
