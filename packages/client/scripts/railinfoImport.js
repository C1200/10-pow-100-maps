import path from "path";
import crypto from "crypto";
import fs from "fs/promises";

const base = "https://railinfo.juliandev02.me";
const file = path.join(import.meta.dirname, "../src/data/transport-stops.json");

const res1 = await fetch(base + "/api/stations").then((r) => r.json());
let output = { poi: [], transportLines: [] };
let addedEntries = 0;

try {
  output = JSON.parse(await fs.readFile(file, "utf8"));
} catch (e) {
  console.error("[warn] Couldn't read file\n", e);
}

const lines = new Set();
let maxLines = 0;
for (const station of res1) {
  for (const line of station.lines) {
    lines.add(line);
  }

  maxLines = Math.max(station.lines.length, maxLines);
}

for (const station of res1) {
  const dsId = "railinfo:" + station.id + ":";
  const coordSet = station.description
    .matchAll(/Coords: "(-?\d+)(?:\s+|\s*,\s*)(-?\d+)"/g)
    .toArray();

  const weight = Math.floor((station.lines.length / maxLines) * 50);
  const  markerType =
    station.type === "public"
      ? "image:publicrail"
      : station.type === "bus"
        ? "image:bus"
        : undefined;

  const existing = output.poi.filter(
    (s) => s.dataSource && s.dataSource.startsWith(dsId),
  );
  if (existing.length > 0) {
    let i = 0;
    for (const ex of existing) {
      delete ex.type;
      delete ex.subtype;

      ex.weight = weight;
      ex.short = "Transport Stop";
      ex.transportLines = station.lines;

      if (ex.marker !== markerType) {
        ex.$marker = markerType;
        console.error(`[warn] Marker change: ${ex.marker} -> ${ex.$marker}`);
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
      marker: markerType,
      short: "Transport Stop",
      label: station.name,
      coords: [parseInt(coords[1]), parseInt(coords[2])],
      weight: weight,
      transportLines: station.lines,

      dataSource: dsId + i++,
    });
    addedEntries++;
  }
}

const res2 = await fetch(base + "/api/lines").then((r) => r.json());

output.transportLines = [];
for (const line of res2) {
  if (!lines.has(line.name)) continue;

  let type = line.type;
  if (type === "public" || type === "private") type = "train";

  output.transportLines.push({
    line: line.name,
    color: line.color,
    type: type,
  });
}

await fs.writeFile(file, JSON.stringify(output, null, 2));
console.error(`[info] Added ${addedEntries} entries`);
