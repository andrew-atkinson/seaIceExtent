import { readFileSync, writeFile, mkdirSync } from "node:fs";
import { fileURLToPath } from "url";
import path from "path";
import * as d3 from "d3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// set up the output object
let seaIceJSON = {};
for (let i = 1973; i <= 2025; i++) {
  seaIceJSON[i] = [];
}

// get the individual month files and store
for (let i = 1; i <= 12; i++) {
  let paddedIndex = i.toString().padStart(2, "0");
  let inputFileName = `tab_extent_mittel_${paddedIndex}_s.txt`;
  let inputFile = readFileSync(`${__dirname}/data/${inputFileName}`, "utf8");
  let cleanedInputFile = inputFile.replace(/;[\s]?/g, " ");
  d3.tsvParseRows(cleanedInputFile, (line) => {
    let splitLine = line[0].split(" ");
    seaIceJSON[splitLine[0]][i - 1] = splitLine[1];
  });
}

/// process the big file data. 1973-1978 not covered in monthly files.
let meanInputFile = readFileSync(
  `${__dirname}/data/extent_s_month_mean.txt`,
  "utf8",
);
d3.tsvParseRows(meanInputFile, (line) => {
  let paddedMonthKey = line[1].padStart(2, "0");
  if (!seaIceJSON[line[0]][paddedMonthKey - 1]) {
    seaIceJSON[line[0]][paddedMonthKey - 1] = line[2];
  }
});

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
