import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Input and output paths
const inputPath = path.join(__dirname, "raw-data", "queens_buildings_seed.csv");
const outputDir = path.join(__dirname, "seed-data");
const outputPath = path.join(outputDir, "buildings.json");

const normalizeBorough = (boro) => {
  if (!boro) return "";
  const value = boro.toString().trim().toUpperCase();

  const map = {
    MANHATTAN: "Manhattan",
    BROOKLYN: "Brooklyn",
    QUEENS: "Queens",
    BRONX: "Bronx",
    "STATEN ISLAND": "Staten Island",
  };

  return map[value] || boro.toString().trim();
};

const safeString = (value) => {
  if (value === null || value === undefined) return "";
  return value.toString().trim();
};

const buildStreetAddress = (houseNumber, streetName) => {
  return `${safeString(houseNumber)} ${safeString(streetName)}`.trim();
};

const buildBBL = (block, lot) => {
  const cleanBlock = safeString(block);
  const cleanLot = safeString(lot);

  if (!cleanBlock || !cleanLot) return "";
  return `${cleanBlock}-${cleanLot}`;
};

const isUsableRow = (row) => {
  const recordStatus = safeString(row.RecordStatus || row.recordstatus);
  const houseNumber = safeString(row.HouseNumber || row.housenumber);
  const streetName = safeString(row.StreetName || row.streetname);
  const zip = safeString(row.Zip || row.zip);
  const bin = safeString(row.BIN || row.bin);
  const boro = safeString(row.Boro || row.boro);

  if (recordStatus.toUpperCase() !== "ACTIVE") return false;
  if (!houseNumber) return false;
  if (!streetName) return false;
  if (!zip) return false;
  if (!bin) return false;
  if (!boro) return false;

  return true;
};

const transformRowToBuilding = (row) => {
  const houseNumber = safeString(row.HouseNumber || row.housenumber);
  const streetName = safeString(row.StreetName || row.streetname);
  const borough = normalizeBorough(row.Boro || row.boro);
  const zipCode = safeString(row.Zip || row.zip);
  const bin = safeString(row.BIN || row.bin);
  const block = safeString(row.Block || row.block);
  const lot = safeString(row.Lot || row.lot);
  const registrationId = safeString(row.RegistrationID || row.registrationid);
  const recordStatus = safeString(row.RecordStatus || row.recordstatus);

  return {
    buildingName: "",
    streetAddress: buildStreetAddress(houseNumber, streetName),
    borough,
    neighborhood: "",
    zipCode,
    bin,
    bbl: buildBBL(block, lot),
    ownerName: "",
    managerName: "",
    riskSummary: {
      highlights: [],
      lastCalculatedAt: new Date().toISOString(),
    },
    housingRecords: [
      {
        sourceDataset: "Buildings Subject to HPD Jurisdiction",
        recordType: "registration",
        category: `HPD jurisdiction${registrationId ? ` / registration ${registrationId}` : ""}`,
        status: recordStatus.toLowerCase(),
        recordDate: new Date().toISOString(),
      },
    ],
  };
};

const dedupeBuildings = (buildings) => {
  const seen = new Set();
  const result = [];

  for (const building of buildings) {
    const key = `${building.bin}|${building.streetAddress}|${building.zipCode}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(building);
    }
  }

  return result;
};

const main = async () => {
  try {
    const csvText = fs.readFileSync(inputPath, "utf8");

    const records = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
      bom: true,
    });

    const usableRows = records.filter(isUsableRow);
    const transformed = usableRows.map(transformRowToBuilding);
    const deduped = dedupeBuildings(transformed);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(deduped, null, 2), "utf8");

    console.log(`Read ${records.length} rows from CSV.`);
    console.log(`Kept ${usableRows.length} usable rows.`);
    console.log(`Wrote ${deduped.length} buildings to ${outputPath}.`);
  } catch (error) {
    console.error("Failed to prepare seed data:", error);
    process.exit(1);
  }
};

main();
