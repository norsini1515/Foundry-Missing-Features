# Missing Features

A Foundry VTT module (dnd5e) with content missing from the system compendiums.

## Install

In Foundry: **Add-on Modules > Install Module**, paste this manifest URL:

```
https://github.com/<owner>/Foundry-Missing-Features/releases/latest/download/module.json
```

## Layout

| Folder             | Compendium  |
|--------------------|-------------|
| `src/subclasses/`  | Subclasses  |
| `src/spells/`      | Spells      |
| `src/items/`       | Items       |
| `src/backgrounds/` | Backgrounds |
| `src/feats/`       | Feats       |

One JSON file per document. Each needs a unique 16-character `_id` and `"_key": "!items!<_id>"`.

Cross-references (ItemGrant advancements, etc.) use `Compendium.missing-features.<category>.Item.<_id>`.

## Build locally

```
npm install
npm run build
```

## Release

Push a version tag. GitHub Actions builds the packs, stamps the version and URLs into `module.json`, and publishes `module.json` + `module.zip`.

```
git tag v1.0.0
git push origin v1.0.0
```
