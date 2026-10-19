# D24_RELEASE_APK — Release / APK Identity / Signing / Installed Evidence

Research audit: READY

DOMAIN_ID=D24_RELEASE_APK
SOURCE_ANALYSIS=Harvested 10 sources (10 primary). Android app signing (official), Core app quality guidelines (official). Localized pages included. 
Focus: release identity (signing keys, package id, versionCode/versionName), Play App Signing model, core quality (stability, UX, permissions, size), installed-device evidence vs build evidence vs mock. 
Harvest sufficient (official Android docs).

CURRENT=Has `apk/` dir, `release/` dir present. Also Capacitor config: `capacitor.config.json` exists. Need to inspect contents (APK files, signing info, release notes, checksums, provenance). Must distinguish Android build evidence vs installed-device evidence (explicit requirement).

TARGET=Release assurance for APK: identity chain (source→build→signed artifact), signing config documented (without secrets), checksums (sha256), versioning, core quality checks, release evidence bundle. Installed evidence only when obtained from real device (explicitly labeled). No secret exposure.

NOW=Inspect `apk/`, `release/` contents: list files, sizes, checksums if present. Check `capacitor.config.json`. Verify identity fields. Document what evidence exists vs missing.

NEXT=Release evidence manifest (artifact paths, sha256, build metadata, signing method), identity verification script, core quality checklist (stability, permissions, crashes), separation of evidence types (build vs installed). 

LATER=Automated signing verification (if public cert), Play integrity hooks, size/bundle analysis, Android vitals checks, reproducible builds where feasible.

TESTS=Artifact integrity (checksums), version consistency, config validation, release manifest schema, no secrets in repo.

RISKS=Leaking signing keys, mixing build/installed evidence, version mismatch, incomplete provenance. Never weaken security policies.

FIRST_SLICE=Catalog `apk/` + `release/` with sha256, create release evidence manifest (deterministic). Smallest proof of release identity.

KNOWN_UNKNOWNS=Whether APKs are signed, with what key, versioning, build reproducibility, installed evidence present.

DOMAIN_VERDICT=READY_FOR_PLAN
