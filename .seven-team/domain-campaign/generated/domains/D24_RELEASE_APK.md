# D24_RELEASE_APK — Release / APK Identity / Signing / Installed Evidence

Research audit: READY

DOMAIN_ID=D24_RELEASE_APK
SOURCE_ANALYSIS=Harvested 10 primary sources, all primary. Sources establish app signing and security concepts, Play App Signing/opt-in, and Core App Quality as install/review/engagement/retention baseline. Freshness is strong. Limitation: harvested notes are summary-level and do not include concrete signing implementation commands; the app is not necessarily Play-distributed, so release identity and exact installed artifact evidence remain the primary local proof.
CURRENT=Release identity is centralized in package.json: version 2.4.3 and sevenAndroidVersionCode 243. Capacitor config uses appId ai.seven.v243 and appName Seven 2.4.3. verify-apk.cjs enforces versionCode/versionName, APK size under 30MB, required bundled assets, release marker, modern UI root, no manual key fields, no password inputs, no legacy name modal, no remote PDF runtime, and no manual Brave key control. The repo has signing/materialization scripts, including apk/patch-production-signing.cjs and apk/remake-build-release-manifest.mjs, but no actual APK or installed artifact is present in this checkout.
TARGET=Release readiness should be proven by exact artifact identity plus installed-device behavior: signed or explicitly unsigned-debug artifact identity, versionCode/versionName, asset manifest, no credential inputs, no remote runtime dependencies, and installed launch/smoke evidence. Evidence must be bound to source/artifact identity.
NOW=Audit release scripts for signing identity, manifest generation, and APK verification coverage; document which checks are static artifact checks versus runtime/device checks. Preserve verify-apk.cjs as the artifact gate and do not relax assertions.
NEXT=Run npm run build:web and android:generate in a capable environment, produce an APK, run android:verify, then collect installed-device launch and persistence evidence. Record artifact hash, version, and signing state.
LATER=Add CI/release pipeline evidence and reproducible build metadata; consider Play App Signing only if Play distribution is chosen.
TESTS=Deterministic: package/version consistency, APK content assertions, manifest/asset checks, no secrets in bundle. E2E/Android: install, launch, version display, offline restart, update path, uninstall/reinstall persistence policy. Adversarial: tampered APK rejection, version downgrade, missing asset, oversized APK, credential field regression.
RISKS=No installed artifact evidence, no signing proof in this checkout, debug/release confusion, identity drift between package.json and generated Gradle, accidental credential bundle inclusion, oversized APK, release claims based only on static checks.
FIRST_SLICE=Static release identity audit and deterministic verification inventory; no production edits in this research stage.
KNOWN_UNKNOWNS=No APK present, no signing keystore state, no installed-device evidence, no exact-build visual/runtime evidence, no CI artifact metadata.
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
