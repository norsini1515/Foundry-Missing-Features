# Missing Features

A Foundry VTT module (dnd5e) with content missing from the system compendiums.

## Install

In Foundry: **Add-on Modules > Install Module**, paste this manifest URL:

```
https://github.com/<owner>/Foundry-Missing-Features/releases/latest/download/module.json
```

## Contents

| Compendium  | Item             | Notes                                              |
|-------------|------------------|----------------------------------------------------|
| Feats       | Cartomancer      |                                                    |
| Feats       | Tireless Reveler | Granted by the Carouser background                 |
| Spells      | Silvery Barbs    |                                                    |
| Backgrounds | Carouser         | ASI (Dex/Int/Cha), Deception + Persuasion, gaming set, grants Tireless Reveler |

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

The build checks every document for a valid `_id` and `_key`, checks that every internal compendium link points at an item in the right pack, and confirms each compiled pack holds the expected number of documents. It stops with an error instead of producing an empty or broken pack.

## Release

Push a version tag. GitHub Actions builds the packs, stamps the version and URLs into `module.json`, and publishes `module.json` + `module.zip`.

```
git tag v1.0.0
git push origin v1.0.0
```
