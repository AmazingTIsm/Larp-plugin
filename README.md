# Cosmetic Studio

Client-side profile cosmetics for Vencord. Custom build by [Amazing Tism](https://github.com/AmazingTIsm), based on [Larpcord by sp5-y](https://github.com/sp5-y/larpcord).

## Features

- Profile badges grouped by type; double-click or use Edit stage to change evolving badge stages.
- Native badge-popup integration, local Nitro years, and duplicate badge prevention.
- Avatar decorations, profile effects, nameplates, and profile frames with searchable catalogs and scroll loading.
- Local guild tags with all 41 bundled icons and an Apply button. No server ID required.
- Local avatar/banner uploads, display-name styles, and font preservation.

Cosmetics are local previews visible on your client. They do not grant subscriptions, purchases, boosts, or server permissions.

## Install from source

Use a [Vencord source checkout](https://github.com/Vendicated/Vencord) with Node.js 22 or newer and pnpm. Copy this repository's `cosmeticStudio` directory into `Vencord/src/userplugins/cosmeticStudio`.

From the Vencord checkout, run:

```sh
pnpm install --frozen-lockfile
pnpm build --dev
pnpm inject
```

Restart Discord, enable **CosmeticStudio** in Vencord Settings > Plugins, and enable the plugin's local cosmetic overrides. Press **Ctrl+B** to open Cosmetic Studio. This shortcut replaces Discord's usual Ctrl+B while enabled.

After changing the source, rebuild with `pnpm build --dev` and restart Discord. Disable the plugin and restart to restore normal rendering.

## Verification

The current build passed TypeScript, desktop and web dev builds, and 30 isolated behavior tests. Live rendering of the latest update has not been verified. Discord's internal modules and product catalog can change.

To run the included tests, copy `tests/*.mjs` into a Vencord checkout's `tests` directory alongside the plugin, then run:

```sh
pnpm test:ts
pnpm exec tsx --test tests/cosmetic-studio.test.mjs tests/native-cosmetics.test.mjs
```

## Credits

- **Amazing Tism** — custom build and project credit.
- **sp5-y / Larpcord** — original plugin source.
- **Vendicated and Vencord contributors** — client framework and APIs.
- **mezotv/discord-badges** — bundled badge artwork; MIT notice included.

See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and `cosmeticStudio/BUILD-INFO.json` for source revisions and attribution.
