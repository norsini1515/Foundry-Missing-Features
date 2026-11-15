// Compiles each src/<category>/ folder of JSON documents into a LevelDB pack at packs/<category>/.
// Every source document needs a unique 16-char "_id" and a "_key" of the form "!items!<_id>",
// otherwise compilePack silently produces an empty pack.
import { compilePack } from "@foundryvtt/foundryvtt-cli";
import { readdirSync, rmSync } from "node:fs";

const CATEGORIES = ["subclasses", "spells", "items", "backgrounds", "feats"];

for (const cat of CATEGORIES) {
  const src = `src/${cat}`;
  const dest = `packs/${cat}`;
  const docs = readdirSync(src).filter((f) => f.endsWith(".json"));
  rmSync(dest, { recursive: true, force: true });
  await compilePack(src, dest, { log: true });
  console.log(`${cat}: ${docs.length} document(s) -> ${dest}`);
}
