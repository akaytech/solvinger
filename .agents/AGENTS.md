# Agent Behavioral Rules

## Versioning Policy for Mini-Tasks
The user has requested a specific 4-tier versioning policy for "mini tasks":
- Every completed mini task must increment a 4th "mini" digit/marker in the app version.
- Due to NPM semver restrictions, use the prerelease suffix format: `Major.Minor.Patch-Mini` (e.g., `0.5.3-1`).
- After reaching `-9` (e.g., `0.5.3-9`), the next mini task must increment the `Patch` version and remove the suffix (e.g., `0.5.4`).
- Then it continues: `0.5.4-1`, `0.5.4-2`, etc.
- ALWAYS update `package.json` using `npm version <version> --allow-same-version` at the end of a task before committing.

## Workflow Rule
"Bundan sonra sana verdiğim her geliştirme promptunda önce benim senden istediğimi bana açıkla, onaylarsam devam et. sohbet ettiğimizde, sorunları tartışırken falan bunu yapmana gerek yok. ama geliştirme promptu verdiğimde önce senden istediklerimi bana özetliceksin daha sonra onay verirsem başlayacaksın."
