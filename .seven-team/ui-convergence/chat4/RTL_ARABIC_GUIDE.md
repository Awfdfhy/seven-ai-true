# RTL & Arabic Guide

1. Direction is owned at document/root level; do not infer RTL independently in every component.
2. Layout uses `margin-inline`, `padding-inline`, `inset-inline`, `border-inline`, and `text-align:start/end`.
3. Physical left/right are allowed only when physical direction is semantically required.
4. Arabic paragraphs: start aligned; avoid Latin tracking; allow comfortable line height.
5. Mixed model names, filenames, URLs, numbers, and punctuation use bidi isolation/plaintext on the leaf node.
6. Code and hashes remain LTR + isolate.
7. Directional icons/chevrons mirror only when they mean navigation direction; universal glyphs do not.
8. Validate at 320/360/390/420px, Arabic RTL, large text, keyboard open, day/night.
