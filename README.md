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
| Subclasses  | Theurgy (Life Domain) | Wizard tradition from UA: Wizard Revisited (2017), with Life Domain benefits built in. Grants its features automatically at wizard levels 2, 6, 10, 14 |
| Class Features | Theurgy features (8) | Divine Inspiration (Life), Arcane Initiate, Channel Arcana, Divine Arcana, Preserve Life, Disciple of Life, Blessed Healer, Supreme Healing |
| Feats       | Cartomancer      |                                                    |
| Feats       | Tireless Reveler | Granted by the Carouser background                 |
| Spells      | Silvery Barbs    |                                                    |
| Backgrounds | Carouser         | ASI (Dex/Int/Cha), Deception + Persuasion, gaming set, grants Tireless Reveler |

### Theurgy notes

- Channel Arcana tracks its uses: 1 per short or long rest, 2 from wizard level 6, 3 from level 18 (a scale value on the subclass, `@scale.theurgy-life.channel-arcana`).
- Divine Arcana and Preserve Life don't deduct those uses automatically; tick Channel Arcana down when using either.
- Disciple of Life leaves out the Life Domain's heavy armor proficiency, as Theurgy requires. The theurgist doesn't get Divine Strike.
- Life Domain spells are added by hand from the dnd5e spell compendium as the wizard learns them.

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
