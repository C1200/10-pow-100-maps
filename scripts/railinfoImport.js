import path from "path";
import crypto from "crypto";
import fs from "fs/promises";

function subtype(riType) {
  switch (riType) {
    case "public":
      return "public-rail";
    case "bus":
      return "bus";
  }

  return "metro-unknown";
}

const base = "https://railinfo.juliandev02.me";
const file = path.join(import.meta.dirname, "../src/data/transport-stops.json");

const res = await fetch(base + "/api/stations").then((r) => r.json());
let output = { poi: [] };
let addedEntries = 0;

try {
  output = JSON.parse(await fs.readFile(file, "utf8"));
} catch (e) {
  console.error("[warn] Couldn't read file\n", e);
}

let maxLines = 0;
for (const station of res) {
  maxLines = Math.max(station.lines.length, maxLines);
}

for (const station of res) {
  const dsId = "railinfo:" + station.id + ":";
  const coordSet = station.description
    .matchAll(/Coords: "(-?\d+) (-?\d+)"/g)
    .toArray();

  const weight = Math.floor((station.lines.length / maxLines) * 10);

  const existing = output.poi.filter(
    (s) => s.dataSource && s.dataSource.startsWith(dsId),
  );
  if (existing.length > 0) {
    let i = 0;
    for (const ex of existing) {
      ex.weight = weight;

      if (ex.subtype !== subtype(station.type)) {
        ex.$subtype = subtype(station.type);
        console.error(`[warn] Subtype change: ${ex.subtype} -> ${ex.$subtype}`);
      }

      if (ex.label !== station.name) {
        ex.$label = station.name;
        console.error(`[warn] Label change: ${ex.label} -> ${ex.$label}`);
      }

      if (i >= coordSet.length) {
        ex.$markedForDeletion = true;
        console.error(`[warn] Entry marked for deletion`);
      } else {
        const coords = [parseInt(coordSet[i][1]), parseInt(coordSet[i][2])];
        if (ex.coords[0] !== coords[0] || ex.coords[1] !== coords[1]) {
          ex.$coords = coords;
          console.error(`[warn] Coords change: ${ex.coords} -> ${ex.$coords}`);
        }
      }

      i++;
    }
    continue;
  }

  let i = 0;
  for (const coords of coordSet) {
    output.poi.push({
      id: crypto.randomUUID(),
      type: "transport-stop",
      subtype: subtype(station.type),
      label: station.name,
      coords: [parseInt(coords[1]), parseInt(coords[2])],
      weight: weight,

      dataSource: dsId + i++,
    });
    addedEntries++;
  }
}

await fs.writeFile(file, JSON.stringify(output, null, 2));
console.error(`[info] Added ${addedEntries} entries`);
