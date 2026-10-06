# Forms, Dialogs & Sheets

Canonical form primitives: Input, Textarea, Select, Toggle, Checkbox, Radio, Slider, Helper, Error, Disabled. Shared fields use the same height, radius, border, focus ring, disabled opacity, and error association.

Desktop modal strategy: centered dialog for decisions/forms. Mobile: centered dialog for confirmations and short forms; bottom sheet only for pickers, compact context actions, and lightweight details. Dialog contract: labelled title, initial focus, focus trap, Escape/Android Back policy, focus restore, contained scrolling, keyboard-safe max height, and explicit outside-tap policy. Destructive confirmations use clear action/cancel order and never rely on red alone.
