# D24_RELEASE_APK — Release / APK Identity / Signing / Installed Evidence

Research audit: READY

DOMAIN_ID=D24_RELEASE_APK
SOURCE_ANALYSIS=Harvested 10 sources (all primary). Android app signing, Play App Signing, core app quality guidelines. Need signing identity, versioning, keystore/security, build reproducibility, quality checks.
CURRENT=`apk/` dir exists, `release/` dir exists, `capacitor.config.json` exists. HTML app likely wrapped. Need to see signing config, build scripts.
TARGET=Reproducible release: signing identity documented, versionCode/name, minSdk/targetSdk, ProGuard/R8 if applicable, core app quality checks, installed-device evidence, artifact checksums.
NOW=Inspect apk/, release/, capacitor.config.json, build scripts.
NEXT=Signing verification, versioning policy, quality gate checklist, evidence bundle.
LATER=Automated release checks, attestation, update policy.
TESTS=Install on device/emulator, core app quality tests, signing validation.
RISKS=Leaked keystore, unsigned/wrongly signed APK, versioning errors, missing quality evidence.
FIRST_SLICE=Document signing identity + build steps; add APK checksum + install evidence template.
KNOWN_UNKNOWNS=Signing state, actual APKs. Need inspection.
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
