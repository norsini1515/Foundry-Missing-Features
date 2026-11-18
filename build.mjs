// Compiles each src/<category>/ folder of JSON documents into a LevelDB pack at packs/<category>/.
// Validates every document first and checks every compiled pack afterward, because compilePack
// silently produces an empty pack when documents are missing "_key".
import { compilePack, extractPack } from "@foundryvtt/foundryvtt-cli";
import { readdirSync, readFileSync, rmSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const MODULE_ID = "missing-features";
const CATEGORIES = ["subclasses", "class-features", "spells", "items", "backgrounds", "feats"];
const ID_RE = /^[A-Za-z0-9]{16}$/;

const errors = [];
const allIds = new Map(); // _id -> "category/file"
const docs = {};

// 1. Validate sources
for (const cat of CATEGORIES) {
  docs[cat] = [];
  for (const file of readdirSync(`src/${cat}`).filter((f) => f.endsWith(".json"))) {
    const where = `src/${cat}/${file}`;
    const doc = JSON.parse(readFileSync(where, "utf8"));
    if (!ID_RE.test(doc._id ?? "")) errors.push(`${where}: _id must be 16 alphanumeric chars`);
    if (doc._key !== `!items!${doc._id}`) errors.push(`${where}: _key must be "!items!${doc._id}"`);
    if (allIds.has(doc._id)) errors.push(`${where}: duplicate _id, also in ${allIds.get(doc._id)}`);
    allIds.set(doc._id, `${cat}/${file}`);
    docs[cat].push({ where, doc, text: readFileSync(where, "utf8") });
  }
}

// 2. Check internal links (Compendium.missing-features.<pack>.Item.<id>) point at real documents
for (const cat of CATEGORIES) {
  for (const { where, text } of docs[cat]) {
    for (const [, pack, id] of text.matchAll(new RegExp(`Compendium\\.${MODULE_ID}\\.([\\w-]+)\\.Item\\.([A-Za-z0-9]{16})`, "g"))) {
      const target = allIds.get(id);
      if (!target) errors.push(`${where}: links to unknown id ${id}`);
      else if (!target.startsWith(`${pack}/`)) errors.push(`${where}: links to ${id} in pack "${pack}", but it lives in ${target}`);
    }
  }
}

if (errors.length) {
  console.error("Build failed:\n  " + errors.join("\n  "));
  process.exit(1);
}

// 3. Compile, then extract to a temp dir and confirm the document count matches
for (const cat of CATEGORIES) {
  const dest = `packs/${cat}`;
  rmSync(dest, { recursive: true, force: true });
  await compilePack(`src/${cat}`, dest);
  const check = mkdtempSync(join(tmpdir(), `${cat}-`));
  await extractPack(dest, check);
  const got = readdirSync(check).filter((f) => f.endsWith(".json")).length;
  rmSync(check, { recursive: true, force: true });
  if (got !== docs[cat].length) {
    console.error(`Build failed: ${cat} compiled ${got} of ${docs[cat].length} document(s)`);
    process.exit(1);
  }
  console.log(`${cat}: ${got} document(s)`);
}
