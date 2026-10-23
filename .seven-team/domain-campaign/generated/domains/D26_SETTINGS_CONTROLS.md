# D26_SETTINGS_CONTROLS — Settings / Model Controls / Progressive Disclosure

Research audit: READY

DOMAIN_ID=D26_SETTINGS_CONTROLS
SOURCE_ANALYSIS=Harvested [SOURCE primary] https://developer.android.com/docs/quality-guidelines/core-app-quality (settings/accessibility/ergonomics). No dedicated settings docs in harvest; relies on Android quality guidelines. Sources emphasize discoverability, progressive disclosure, touch targets. 
CURRENT=SettingsModal.tsx exists. ModelSelector.tsx exists. ThemeContext exists. UpgradeModal.tsx exists. Grepped settings/model/reasoning: found ModelSelector and SettingsModal. Need to inspect implementation. 
TARGET=Clear settings hierarchy, progressive disclosure, model controls discoverable, reasoning/deep think controls obvious, safe defaults, keyboard accessible, mobile-friendly. 
NOW=Inspect SettingsModal.tsx and ModelSelector.tsx. Map control surface (theme, model, reasoning, etc.). Check discoverability, grouping, labels. Audit touch targets. 
NEXT=Improve grouping, add descriptions, progressive disclosure for advanced, consistent styling, keyboard nav. 
LATER=Settings search, presets, sync, better model metadata. 
TESTS=Deterministic: component tests. E2E: open settings, change model, persist. A11y: keyboard. Android: ergonomics. 
RISKS=Control bloat, confusing model selection, settings hidden. 
FIRST_SLICE=Read SettingsModal.tsx and ModelSelector.tsx, produce control inventory with gaps and concrete improvements. 
KNOWN_UNKNOWNS=Actual settings content unknown. Persistence mechanism unknown. 
DOMAIN_VERDICT=READY_FOR_PLAN
