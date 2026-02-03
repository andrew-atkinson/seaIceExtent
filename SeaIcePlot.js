import * as Plot from "@observablehq/plot";
import fs from "node:fs";
import { JSDOM } from "jsdom";

// virtual DOM
const dom = new JSDOM(`<!DOCTYPE html><body></body>`);
const document = dom.window.document;

let jsonData, data;

const args = process.argv.slice(2); // Slice from index 2 to ignore 'node' and 'my-script.js'

// Default CLI arguments
const options = {
  monochrome: false,
  colorScheme: "RdBu",
};

// Parse CLI arguments
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--monochrome" || args[i] === "-m") {
    options.monochrome = true;
  } else if (
    (args[i] === "--color" || args[i] === "-c") &&
    i + 1 < args.length
  ) {
    options.colorScheme = args[i + 1];
    i++; // Skip the next argument as we've already processed it
  }
}

console.log(
  "Options:",
  options.monochrome ? " Monochrome" : " Color: " + options.colorScheme,
);

try {
  jsonData = fs.readFileSync("output/SeaIceExtentProcessed.json", "utf8");
  data = JSON.parse(jsonData);
} catch (error) {
  console.error("Error reading or parsing the JSON file:", error);
}

// Create extent plot and write to svg file
let marks = [];

Object.entries(data).forEach(([key, value]) => {
  let lineY = Plot.lineY(value, {
    x: "month",
    y: "extent",
    curve: "basis",
    ...(options.monochrome
      ? { strokeDasharray: [3 + (key - 1973) / 4, 13] }
      : { strokeDasharray: [1, 0] }),
    ...(options.monochrome
      ? { stroke: "black" }
      : { stroke: (2025 - key) / (2025 - 1979) }),
  });
  marks.push(lineY);
});

let plot = Plot.plot({
  document,
  marks: [
    ...marks,
    Plot.axisX({ anchor: "bottom", label: null }),
    Plot.axisY({ label: null }),
  ],
  grid: true,
  width: 1200,
  height: 600,
  ...(options.monochrome
    ? {}
    : {
        color: {
          type: "diverging",
          scheme: options.colorScheme,
          domain: [0, 1],
        },
      }),
});

const svgString = plot.outerHTML;
fs.writeFileSync(
  `outputPlot${options.monochrome ? "-mono" : "-" + options.colorScheme}.svg`,
  svgString,
  "utf-8",
);

// Dev from mean plot and write to file
let devFromMeanMarks = [Plot.ruleY([0])];

Object.entries(data).forEach(([key, value]) => {
  let lineY = Plot.lineY(value, {
    x: "month",
    y: "devFromMean",
    curve: "basis",
    ...(options.monochrome
      ? { strokeDasharray: [3 + (key - 1973) / 4, 13] }
      : { strokeDasharray: [1, 0] }),
    ...(options.monochrome
      ? { stroke: "black" }
      : { stroke: (2025 - key) / (2025 - 1979) }),
  });
  devFromMeanMarks.push(lineY);
});

let devFromMeanPlot = Plot.plot({
  document,
  marks: devFromMeanMarks,
  grid: true,
  width: 1200,
  height: 600,
  ...(options.monochrome
    ? {}
    : {
        color: {
          type: "diverging",
          scheme: options.colorScheme,
          domain: [0, 1],
        },
      }),
});

const svgStringDevFromMean = devFromMeanPlot.outerHTML;
fs.writeFileSync(
  `devFromMeanOutputPlot${options.monochrome ? "-mono" : "-" + options.colorScheme}.svg`,
  svgStringDevFromMean,
  "utf-8",
);
