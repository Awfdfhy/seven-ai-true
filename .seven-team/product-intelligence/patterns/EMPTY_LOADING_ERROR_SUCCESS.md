# Pattern Library — Empty, Loading, Error & Success States

Status: ACTIVE KNOWLEDGE PACK

## Empty

Explain what the user can do next with one primary action or example. Do not present internal setup jargon.

## Loading

Communicate meaningful phase when duration is nontrivial: connecting, searching, reading, reasoning, uploading, restoring. Avoid generic infinite spinners for multi-stage work.

## Error

Preserve work; say what failed; distinguish offline/auth/rate-limit/provider/storage/file-format failures; provide one clear recovery path. Hide sensitive implementation detail.

## Success

Use confirmation proportional to consequence. Do not interrupt routine actions with celebratory chrome.

## Anti-patterns

Blank screen; toast-only critical error; retry that duplicates state; loading skeleton unlike final geometry; disabled control with no recovery explanation.
