# Seven Visual Intelligence 1.0 - Challenge A

Status: MATERIAL_IMPROVEMENT_FOUND
Saturation counter: 0/2
Lens: evidence validity, usability, evaluator independence, provenance, rendering reproducibility, privacy, platform integration.

## Result
The V1 architecture is strong but not yet saturation-eligible.

## Material findings

### A1. Visual quality needs behavioral usability evidence
Functional replay proves that a path works, but not whether people can efficiently understand and use it.
Add a Behavioral Experience Plane for task completion friction, error/mis-tap patterns, discoverability, comprehension and time-to-critical-action. Do not reduce this to screenshots.

### A2. Visual judges need calibration and disagreement handling
Multiple judges are not enough if they share the same bias or drift together.
Add evaluator calibration sets, disagreement receipts, abstention, confidence calibration, judge-version lineage and escalation when subjective verdicts conflict.

### A3. Generated visual assets need provenance and anti-copy controls
Logo/illustration/icon candidates may accidentally resemble known brands or inherit uncertain asset provenance.
Add asset provenance, source/reference lineage, anti-imitation similarity review, license status for imported assets and a pre-freeze collision review. This is not a legal guarantee.

### A4. Rendering environment must be fingerprinted
Screenshot comparisons can change because browser/font/rasterization/DPR/OS changed.
Bind decisive evidence to renderer/browser version, font set/hash, DPR, viewport, locale, color-scheme, reduced-motion and capture implementation. Environment changes that can affect verdict start a new comparison epoch or invalidate direct comparison.

### A5. Screenshot privacy is not explicit enough in the new fabric
Inherited Visual Evidence rules help, but the new system should explicitly prevent secrets, personal files, credentials or sensitive project content from entering visual datasets by default.
Add synthetic fixtures, redaction, retention rules and evidence-minimization requirements.

### A6. Accessibility needs additional perception and assistive-tech lenses
Add color-vision-deficiency checks/simulations where useful, high-contrast/forced-color compatibility where applicable, TalkBack/screen-reader device evidence before release claims, display/font scaling, and focus-order/semantic-name-role-value checks.

### A7. Android system-integration scenarios are underspecified
Add edge-to-edge/system-bar insets, gesture-navigation regions, display cutouts, orientation/resizing and foldable/multi-window diagnostics where material. Web viewport checks cannot prove these device behaviors.

### A8. Candidate isolation needs an explicit visual sandbox
A visual candidate must not modify decisive tests, baseline assets, evaluation rubrics or judge configuration inside the same epoch.
Add Candidate Studio isolation and signed/hashed baseline/evaluation identities, analogous to Self-Evolution's evaluation firewall.

### A9. Design system migration/reversibility needs proof
Moving from current --seven-* and --sb-* dialects to a canonical genome can create a giant one-shot regression.
Add token mapping, incremental migration, compatibility adapters, coverage accounting and rollback at component/token-family granularity.

## Verdict
MATERIAL_IMPROVEMENT_FOUND.

The constitution is not frozen. Integrate these findings and restart saturation at 0/2.