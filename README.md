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

## The Epoch Descent

| Compendium | Contents |
|------------|----------|
| Monsters   | 24 meadow hunters (four per epoch: two fast, two tanks) and the 7 Swamp Crossing creatures |
| NPCs       | Ruka, Syraa, Lyra, the Grandfather, and The Field (an initiative placeholder) |
| Roll Tables | Tag: field, fold glitch, both fold visions, Ruka's tricks, the six hunter tables, extinction by epoch, the Grandfather's small talk and the girls' lines |
| Scenes     | The Meadow: Tag (28 x 28 grid, 100 px, 5 ft) |
| Macros     | Tag: Set Up the Meadow, Tag: Start of Round, Tag: Fold |

### Running tag

1. Import **The Meadow: Tag** from Scenes and view it.
2. Run **Tag: Set Up the Meadow**. It imports the tables and NPCs into "Tag" folders, places the Grandfather, Lyra, Syraa and Ruka, outlines the folds and lag patches (GM only), and creates the encounter with The Field on initiative 99 and Ruka. It skips anything already there, so it's safe to run twice.
3. Add the player tokens to the tracker, roll initiative, and Begin Combat.
4. On The Field's turn each round, run **Tag: Start of Round**. It describes the sun, whispers you the clock, and rolls the field. On rounds 2 and 4 it asks whose home epoch is it, rolls that hunter table privately, imports the hunter and places it hidden at the field's edge, right after Ruka in initiative. At the start of round 4 it removes hunter #1.
5. When someone steps into a fold, run **Tag: Fold**. A 7 or 8 also rolls the vision privately.

Hunters are hidden tokens: Foundry can't show a token to only one player, so reveal it when the field matches its epoch or someone reveals it, and tell the hunted player privately until then.

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
| `src/creatures/monsters/` | Monsters (Actor) |
| `src/creatures/npcs/` | NPCs (Actor) |
| `src/tables/`      | Roll Tables |
| `src/scenes/`      | Scenes      |
| `src/macros/`      | Macros      |

Map images live in `assets/maps/` and ship in the release zip.

One JSON file per document. Each needs a unique 16-character `_id` and a `_key` for its collection: `!items!<_id>`, `!actors!<_id>`, `!tables!<_id>`, `!scenes!<_id>` or `!macros!<_id>`. Embedded documents need their own: actor items use `!actors.items!<actorId>.<itemId>` and table results use `!tables.results!<tableId>.<resultId>`. The build checks all of these.

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
