# Seven AI

Current candidate: `seven_ai-final.html` (T163 runtime hardening). Architecture: `SEVEN_AI_ARCHITECTURE_V4.md`.

## Tests

With Node.js 20 or newer:

```sh
npm install --no-save playwright
npx playwright install --with-deps --only-shell chromium
node all.cjs
```

All suites test the final candidate. The runner exits unsuccessfully if any suite fails, including browser startup or assertions. Browser tests use isolated storage and block external requests; no live provider calls are made. GitHub Actions runs the same command on pushes, pull requests, and manual dispatch.

Android/APK and live provider integration are separate, unverified gates. See `DEVELOPMENT_REPORT.md` for implementation details and the current verification record.
