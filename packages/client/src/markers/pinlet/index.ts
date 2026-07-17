import type { Marker } from "../types";

import background from "./marker-background.png";
import window from "./marker-window.png";

const SERVICES_1 = "#1a73e8";
const SERVICES_2 = "#697ad4";
const FOOD_DRINK = "#ff8126";
const EXPERIENCES = "#b56aff";
const LIVING = "#f848c7";
const GREENSPACE = "#17a773";
const OTHER = "#78909c";

export const pinletMarkers = [
  { id: "airport", color: SERVICES_1 },
  { id: "bar", color: FOOD_DRINK },
  { id: "cafe", color: FOOD_DRINK },
  { id: "camera", color: EXPERIENCES },
  { id: "camping", color: GREENSPACE },
  { id: "cemetery", color: OTHER },
  { id: "convenience", color: SERVICES_1 },
  { id: "dot", color: OTHER },
  { id: "eventvenue", color: EXPERIENCES },
  { id: "ferriswheel", color: EXPERIENCES },
  { id: "fishing", color: GREENSPACE },
  { id: "flower", color: GREENSPACE },
  { id: "golf", color: GREENSPACE },
  { id: "grocery", color: SERVICES_1 },
  { id: "hiking", color: GREENSPACE },
  { id: "historic", color: EXPERIENCES },
  { id: "lodging", color: LIVING },
  { id: "movie", color: EXPERIENCES },
  { id: "museum", color: EXPERIENCES },
  { id: "petrol", color: SERVICES_2 },
  { id: "police", color: OTHER },
  { id: "postoffice", color: OTHER },
  { id: "resort", color: GREENSPACE },
  { id: "restaurant", color: FOOD_DRINK },
  { id: "restroom", color: SERVICES_2 },
  { id: "school", color: OTHER },
  { id: "shopping", color: SERVICES_1 },
  { id: "stadium", color: GREENSPACE },
  { id: "theatre", color: EXPERIENCES },
  { id: "tree", color: GREENSPACE },
  { id: "worshipchristian", color: OTHER },
].map<Marker>((v) => ({
  id: `pinlet:${v.id}`,
  async load() {
    const url = (await import(`./icon-${v.id}.png`)).default;
    return await renderPinletType(v.id, url, v.color);
  },
}));

function preloadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve) => {
    const image = new Image();
    image.src = url;
    image.onload = () => {
      resolve(image);
    };
  });
}

const renderCache: { [x in string]: string } = {};
async function renderPinletType(id: string, url: string, color: string) {
  const pwindow = preloadImage(window);
  const picon = preloadImage(url);
  const pbackground = preloadImage(background);

  if (!renderCache[id]) {
    const canvas = document.createElement("canvas");

    const w = (canvas.width = 28);
    const h = (canvas.height = 32);

    const context = canvas.getContext("2d");
    if (!context) throw new Error("Render failed");

    context.fillStyle = color;
    context.fillRect(0, 0, w, h);
    context.globalCompositeOperation = "destination-in";
    await pwindow.then((i) => context.drawImage(i, 0, 0));

    context.filter = "brightness(0) saturate(1) invert(1)";
    context.globalCompositeOperation = "source-over";
    await picon.then((i) => context.drawImage(i, 0, 0));

    context.globalCompositeOperation = "destination-over";
    await pbackground.then((i) => context.drawImage(i, 0, 0));

    renderCache[id] = canvas.toDataURL("image/png");
  }

  return renderCache[id];
}
