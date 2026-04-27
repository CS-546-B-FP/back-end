import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { closeConnection } from "../config/mongoConnection.js";
import {
  users,
  buildings,
  reviews,
  shortlists,
} from "../config/mongoCollections.js";

import { createUser, toggleWatchlist } from "../data/users.js";
import { createBuilding } from "../data/buildings.js";
import { createReview } from "../data/reviews.js";
import {
  createShortlist,
  addItemToShortlist,
  updateItemNote,
} from "../data/shortlists.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seed = async () => {
  try {
    // ----------------------------
    // Clear existing data
    // ----------------------------
    const reviewCollection = await reviews();
    const shortlistCollection = await shortlists();
    const buildingCollection = await buildings();
    const userCollection = await users();

    await reviewCollection.deleteMany({});
    await shortlistCollection.deleteMany({});
    await buildingCollection.deleteMany({});
    await userCollection.deleteMany({});

    await reviewCollection.createIndex(
      { buildingId: 1, userId: 1 },
      { unique: true, partialFilterExpression: { status: 'published' } }
    );

    console.log("Old data removed.");

    // ----------------------------
    // Seed users
    // ----------------------------
    const admin = await createUser(
      "Admin",
      "User",
      "admin@leasewise.com",
      "admin",
      "Admin1234!",
      "admin",
    );

    const cindy = await createUser(
      "Cindy",
      "Xin",
      "cindy@example.com",
      "cindyx",
      "Password123!",
      "user",
    );

    const peter = await createUser(
      "Peter",
      "Liao",
      "peter@example.com",
      "peterl",
      "Password123!",
      "user",
    );

    const amy = await createUser(
      "Amy",
      "Chen",
      "amy@example.com",
      "amyc",
      "Password123!",
      "user",
    );

    console.log("Users seeded.");

    // ----------------------------
    // Seed buildings from JSON
    // ----------------------------
    const buildingsPath = path.join(__dirname, "seed-data", "buildings.json");
    const buildingsData = JSON.parse(fs.readFileSync(buildingsPath, "utf8"));

    if (!Array.isArray(buildingsData) || buildingsData.length === 0) {
      throw new Error("buildings.json is missing or empty.");
    }

    const createdBuildings = [];

    for (const building of buildingsData) {
      const created = await createBuilding(building, admin._id);
      createdBuildings.push(created);
    }

    console.log(`Buildings seeded: ${createdBuildings.length}`);

    if (createdBuildings.length < 4) {
      throw new Error(
        "Need at least 4 buildings in buildings.json for reviews and shortlists.",
      );
    }

    const [building1, building2, building3, building4] = createdBuildings;

    // ----------------------------
    // Seed reviews
    // ----------------------------
    await createReview(
      building1._id,
      cindy._id,
      "The location is convenient, but the heat issues in winter were very frustrating.",
      3,
      ["heat", "maintenance"],
    );

    await createReview(
      building1._id,
      peter._id,
      "I liked the neighborhood, but the open violations would make me think twice.",
      2,
      ["violations", "repairs"],
    );

    await createReview(
      building2._id,
      amy._id,
      "Management responded fairly quickly, and the building felt safer than expected.",
      4,
      ["responsiveness"],
    );

    await createReview(
      building2._id,
      cindy._id,
      "Past bedbug history is a concern, but the recent records looked better.",
      3,
      ["bedbugs"],
    );

    await createReview(
      building3._id,
      peter._id,
      "The unit layout was nice, but I was concerned after seeing litigation history.",
      2,
      ["litigation"],
    );

    await createReview(
      building4._id,
      amy._id,
      "This was one of the cleaner options I checked, and the records looked relatively calm.",
      5,
      ["overall"],
    );

    console.log("Reviews seeded.");

    // ----------------------------
    // Seed shortlists
    // ----------------------------
    const cindyShortlist = await createShortlist(
      cindy._id,
      "My Apartment Hunt",
    );

    await addItemToShortlist(cindyShortlist._id, cindy._id, building1._id);
    await addItemToShortlist(cindyShortlist._id, cindy._id, building2._id);
    await addItemToShortlist(cindyShortlist._id, cindy._id, building4._id);

    await updateItemNote(
      cindyShortlist._id,
      cindy._id,
      building1._id,
      "Great location, but I need to ask more about heat complaints.",
    );
    await updateItemNote(
      cindyShortlist._id,
      cindy._id,
      building2._id,
      "Worth comparing because management seems somewhat responsive.",
    );
    await updateItemNote(
      cindyShortlist._id,
      cindy._id,
      building4._id,
      "Looks like the safest option so far.",
    );

    const peterShortlist = await createShortlist(
      peter._id,
      "Buildings to Compare",
    );

    await addItemToShortlist(peterShortlist._id, peter._id, building2._id);
    await addItemToShortlist(peterShortlist._id, peter._id, building3._id);

    await updateItemNote(
      peterShortlist._id,
      peter._id,
      building2._id,
      "Need to verify if the bedbug issue is fully resolved.",
    );
    await updateItemNote(
      peterShortlist._id,
      peter._id,
      building3._id,
      "Check whether litigation is still active before considering.",
    );

    console.log("Shortlists seeded.");

    // ----------------------------
    // Seed watchlists
    // ----------------------------
    await toggleWatchlist(cindy._id, building1._id);
    await toggleWatchlist(cindy._id, building4._id);

    await toggleWatchlist(peter._id, building2._id);
    await toggleWatchlist(amy._id, building3._id);

    console.log("Watchlists seeded.");
    console.log("Seed complete.");
  } catch (e) {
    console.error("Seed failed:", e);
  } finally {
    await closeConnection();
  }
};

seed();
