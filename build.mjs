// Compiles each src/<folder>/ of JSON documents (see PACKS) of JSON documents into a LevelDB pack at packs/<category>/.
// Validates every document first and checks every compiled pack afterward, because compilePack
// silently produces an empty pack when documents are missing "_key".
import { compilePack, extractPack } from "@foundryvtt/foundryvtt-cli";
import { readdirSync, readFileSync, rmSync, mkdtempSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const MODULE_ID = "missing-features";
// src folder, pack name, document collection, and the embedded collections to validate.
const PACKS = [
  ...["subclasses", "class-features", "spells", "items", "backgrounds", "feats"].map((p) => ({ dir: p, pack: p, coll: "items" })),
  { dir: "features", pack: "features", coll: "items" },
  { dir: "creatures/monsters", pack: "monsters", coll: "actors", embedded: { items: "items" } },
  // One folder per character, one file per version; each character folder has a _folder.json (a compendium folder)
  { dir: "npcs", pack: "npcs", coll: "actors", embedded: { items: "items" }, recursive: true },
  { dir: "encounters/tag/actors", pack: "encounter-actors", coll: "actors", embedded: { items: "items" } },
  { dir: "tables", pack: "tables", coll: "tables", embedded: { results: "results" } },
  { dir: "scenes", pack: "scenes", coll: "scenes" },
  { dir: "macros", pack: "macros", coll: "macros" },
];
const ID_RE = /^[A-Za-z0-9]{16}$/;

const errors = [];
const allIds = new Map(); // _id -> "category/file"
const docs = {};

// JSON files in a folder, and in its subfolders when recursive
const jsonFiles = (dir, recursive) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) return recursive ? jsonFiles(p, true) : [];
    return f.endsWith(".json") ? [p] : [];
  });

// 1. Validate sources, including embedded documents (actor items, table results) and compendium folders
for (const { dir, pack, coll, embedded = {}, recursive = false } of PACKS) {
  docs[pack] = [];
  for (const where of jsonFiles(`src/${dir}`, recursive)) {
    const doc = JSON.parse(readFileSync(where, "utf8"));
    const file = where.slice(`src/${dir}/`.length);
    const isFolder = file.endsWith("_folder.json");
    const keyColl = isFolder ? "folders" : coll;
    if (!ID_RE.test(doc._id ?? "")) errors.push(`${where}: _id must be 16 alphanumeric chars`);
    if (doc._key !== `!${keyColl}!${doc._id}`) errors.push(`${where}: _key must be "!${keyColl}!${doc._id}"`);
    if (allIds.has(doc._id)) errors.push(`${where}: duplicate _id, also in ${allIds.get(doc._id)}`);
    allIds.set(doc._id, `${pack}/${file}`);
    for (const [field, sub] of Object.entries(embedded)) {
      const seen = new Set();
      for (const child of doc[field] ?? []) {
        if (!ID_RE.test(child._id ?? "")) errors.push(`${where}: ${field} "${child.name ?? child._id}" needs a 16-char _id`);
        if (seen.has(child._id)) errors.push(`${where}: duplicate ${field} _id ${child._id}`);
        seen.add(child._id);
        const key = `!${coll}.${sub}!${doc._id}.${child._id}`;
        if (child._key !== key) errors.push(`${where}: ${field} "${child.name ?? child._id}" _key must be "${key}"`);
      }
    }
    docs[pack].push({ where, doc, text: readFileSync(where, "utf8") });
  }
}

// 2. Check internal links (Compendium.missing-features.<pack>.Item.<id>) point at real documents
for (const { pack: cat } of PACKS) {
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
for (const { dir, pack: cat, recursive = false } of PACKS) {
  const dest = `packs/${cat}`;
  rmSync(dest, { recursive: true, force: true });
  await compilePack(`src/${dir}`, dest, { recursive });
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
