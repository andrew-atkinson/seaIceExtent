import { readFileSync, writeFile, mkdirSync } from "node:fs";
import { fileURLToPath } from "url";
import path from "path";
import * as d3 from "d3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// set up the output object
let seaIceJSON = {};

let firstYear = 1973;
let lastYear = 2025;

for (let i = firstYear; i <= lastYear; i++) {
  seaIceJSON[i] = [];
}

// // get the individual month files and store
for (let i = 1; i <= 12; i++) {
  let monthKey = i.toString().padStart(2, "0");
  let inputFileName = `tab_extent_mittel_${monthKey}_s.txt`;
  let inputFile = readFileSync(`${__dirname}/data/${inputFileName}`, "utf8");
  let cleanedInputFile = inputFile.replace(/;[\s]?/g, " ");
  d3.tsvParseRows(cleanedInputFile, (line) => {
    let splitLine = line[0].split(" ");
    let yearIndex = splitLine[0];
    seaIceJSON[yearIndex].push({
      month: i,
      extent: +splitLine[1],
    });
  });
}

// process the big file data. 1973-1978 not covered in monthly files.
let meanInputFile = readFileSync(
  `${__dirname}/data/extent_s_month_mean.txt`,
  "utf8",
);

d3.tsvParseRows(meanInputFile, (line) => {
  if (!seaIceJSON[line[0]][+line[1]]) {
    seaIceJSON[line[0]].push({ month: +line[1], extent: +line[2] });
  }
});

// calculate means by month
let meanByMonth = {};

Object.entries(seaIceJSON).forEach(([year, values]) => {
  values.forEach((d) => {
    let month = d.month;
    if (!meanByMonth[month]) {
      meanByMonth[month] = {
        mean: 0,
        count: 0,
        total: 0,
      };
    }
    meanByMonth[month].count += 1;
    meanByMonth[month].total += d.extent;
  });
});

Object.entries(seaIceJSON).forEach(([month, values]) => {
  values.forEach((d) => {
    let month = d.month;
    meanByMonth[month].mean =
      meanByMonth[month].total / meanByMonth[month].count;
  });
});

// add difference from mean data to the JSON
Object.entries(seaIceJSON).forEach(([year, values]) => {
  values.forEach((d) => {
    let month = d.month;
    d.devFromMean = d.extent - meanByMonth[month].mean;
  });
});

// write out the processed JSON file
let outputFile = "SeaIceExtentProcessed.json";
let fileContents = JSON.stringify(seaIceJSON);

mkdirSync(`${__dirname}/output`, { recursive: true });
writeFile(`${__dirname}/output/${outputFile}`, fileContents, (err) => {
  if (err) {
    console.error(err);
  } else {
    console.log(
      `file: web/${outputFile} written! Number of years processed: ${Object.keys(seaIceJSON).length}. Number of months processed: ${Object.keys(seaIceJSON).length * 12}.`,
    );
  }
});
