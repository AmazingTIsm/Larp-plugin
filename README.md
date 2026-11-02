# Cosmetic Studio

Client-side profile cosmetics for Vencord. Custom build by [Amazing Tism](https://github.com/AmazingTIsm), based on [Larpcord by sp5-y](https://github.com/sp5-y/larpcord).

## Features

- Profile badges grouped by type; double-click or use Edit stage to change evolving badge stages.
- Native badge-popup integration, local Nitro years, and duplicate badge prevention.
- Avatar decorations, profile effects, nameplates, and profile frames with searchable catalogs and scroll loading.
- Local guild tags with all 41 bundled icons and an Apply button. No server ID required.
- Local avatar/banner uploads, display-name styles, and font preservation.

Cosmetics are local previews visible on your client. They do not grant subscriptions, purchases, boosts, or server permissions.

## Nitro, typing, sharing, and Rich Presence

- Nitro > Enable local Nitro customization enables local native cosmetic Apply and Vencord FakeNitro emoji/sticker rendering and stream options. Profile primary/accent colors can be previewed locally; native theme colors and custom typing-style selections are consumed locally.
- Nitro > Enable typing indicators enables Vencord TypingIndicator and TypingTweaks with avatars, dots and role colors. Restart Discord to load their patches.
- Existing sharing is limited to compatible FakeProfileThemes themes and Decor avatar decorations. Copy the theme code and save it in your Discord bio yourself, or enable Decor, restart, authenticate yourself and choose a Decor item. Other users need the matching compatible plugins. Fake badges, shop frames, guild tags and nameplates remain local. Enabling Decor clears the competing local avatar-decoration override.
- Rich Presence opens Vencord's CustomRPC editor for activity type, text, images, buttons and exact timestamps. Apply/Stop/New controls manage the activity; elapsed/countdown controls set its duration. Save up to 20 presets and switch between them. Saving a preset is local; Apply sends the activity through Discord. Other users can see it when Discord Activity Sharing is enabled.
- Server-controlled subscriptions, purchases, boosts and accepted upload limits are unchanged.

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

The current build passed TypeScript, desktop and web dev builds, and 37 isolated behavior tests. Live rendering of the latest update has not been verified. Discord's internal modules and product catalog can change.

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
