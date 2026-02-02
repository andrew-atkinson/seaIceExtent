import * as Plot from "@observablehq/plot";
import fs from "node:fs";
import { JSDOM } from "jsdom";

// virtual DOM
const dom = new JSDOM(`<!DOCTYPE html><body></body>`);
const document = dom.window.document;

let jsonData, data;

try {
  jsonData = fs.readFileSync("output/SeaIceExtentProcessed.json", "utf8");
  data = JSON.parse(jsonData);
} catch (error) {
  console.error("Error reading or parsing the JSON file:", error);
}

// create extent plot and write to svg file
let marks = [Plot.ruleY([0])];

Object.entries(data).forEach(([key, value]) => {
  let lineY = Plot.lineY(value, {
    x: "month",
    y: "extent",
    stroke: (2025 - key) / (2025 - 1979),
    curve: "basis",
  });
  marks.push(lineY);
});

let plot = Plot.plot({
  document,
  marks,
  grid: true,
  width: 1200,
  height: 600,
  color: {
    type: "diverging",
    scheme: "RdBu",
    domain: [0, 1],
  },
});

const svgString = plot.outerHTML;
fs.writeFileSync("outputPlot.svg", svgString, "utf-8");

// dev from mean plot and write to file
let devFromMeanMarks = [Plot.ruleY([0])];

Object.entries(data).forEach(([key, value]) => {
  let lineY = Plot.lineY(value, {
    x: "month",
    y: "devFromMean",
    stroke: (2025 - key) / (2025 - 1979),
    curve: "basis",
  });
  devFromMeanMarks.push(lineY);
});

let devFromMeanPlot = Plot.plot({
  document,
  marks: devFromMeanMarks,
  grid: true,
  width: 1200,
  height: 600,
  color: {
    type: "diverging",
    scheme: "RdBu",
    domain: [0, 1],
  },
});

const svgStringDevFromMean = devFromMeanPlot.outerHTML;
fs.writeFileSync("devFromMeanOutputPlot.svg", svgStringDevFromMean, "utf-8");
