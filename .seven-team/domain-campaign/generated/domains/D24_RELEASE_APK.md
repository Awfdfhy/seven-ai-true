# D24_RELEASE_APK — Release / APK Identity / Signing / Installed Evidence

Research audit: READY

DOMAIN_ID=D24_RELEASE_APK
SOURCE_ANALYSIS=Harvested 10 primary sources (app signing, core app quality, localized duplicates). They say: app signing concepts and Play App Signing opt-in matter for release identity; core app quality guidelines influence installs/reviews/retention. Limitations: harvested notes are summaries; no Seven-specific signing evidence beyond release docs; duplicates dominate. Freshness: current Android Developers docs.
CURRENT=Release docs (remake/FINAL_RELEASE_STATUS.md, remake/MILESTONES.md) claim COMPLETE: dedicated app id `ai.seven.remake.v3`, production `SevenRemakeNative` bridge, deterministic SHA-256 manifest embedded, installed package/version and every web-payload file verified, WebView boot smoke, native bridge round-trip, Android 14 and 16 gates PASS, artifact `Seven-Remake-V3.apk` with sha256 `aa75260a...`. In-repo evidence: apk/verify-apk.cjs, apk/remake-build-release-manifest.mjs, release/build-release.cjs, release/release-verify.cjs, capacitor.config.json. No actual APK file is present in the worktree (find returned none). No signing keystore or signing config visible. No installed-device test artifacts in repo.
TARGET=Reproducible signed release APK with verifiable identity (package id, version, payload SHA-256) and installed-device evidence retained as artifacts, not just prose claims.
NOW=Reconcile the claimed release evidence against in-repo artifacts: locate APK, signing config, keystore references, manifest, and gate logs; document gaps.
NEXT=Run verify-apk and release-verify if tooling allows; capture exact outputs; require CI run IDs as evidence; add missing installed-device test artifacts to repo or release storage.
LATER=Play App Signing opt-in, reproducible builds, SBOM, artifact attestation, automated release-gate dashboard.
TESTS=apk/verify-apk.cjs, release/release-verify.cjs, release/static-audit.cjs, release/embedded-credentials.test.cjs; CI run evidence 37160934350 and 37160934367.
RISKS=Release claims cannot be independently verified from this worktree: no APK file, no signing keystore, no installed-device artifacts. If CI evidence is unavailable, release state must be marked UNPROVEN. Risk of over-claiming release readiness.
FIRST_SLICE=Produce a D24 evidence ledger mapping each claimed gate to an in-repo artifact or external CI run id, marking missing ones UNPROVEN.
KNOWN_UNKNOWNS=Whether the APK actually exists and is signed; whether installed-device tests are reproducible from this repo; signing key ownership and rotation policy.
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
