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

const seed = async () => {
  try {
    // Clear existing data
    const reviewCollection = await reviews();
    const shortlistCollection = await shortlists();
    const buildingCollection = await buildings();
    const userCollection = await users();

    await reviewCollection.deleteMany({});
    await shortlistCollection.deleteMany({});
    await buildingCollection.deleteMany({});
    await userCollection.deleteMany({});

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
    // Seed buildings
    // ----------------------------
    const building1 = await createBuilding(
      {
        buildingName: "The Hudson Arms",
        streetAddress: "123 W 110th St",
        borough: "Manhattan",
        neighborhood: "Morningside Heights",
        zipCode: "10026",
        bin: "1000001",
        bbl: "1012340001",
        ownerName: "Hudson Property LLC",
        managerName: "CityLine Management",
        riskSummary: {
          highlights: ["Repeated heat complaints", "Open severe violations"],
          lastCalculatedAt: new Date("2026-03-10T12:00:00Z"),
        },
        housingRecords: [
          {
            sourceDataset: "Housing Maintenance Code Complaints and Problems",
            recordType: "complaint",
            category: "heat/hot water",
            status: "open",
            recordDate: new Date("2026-03-10T00:00:00Z"),
          },
          {
            sourceDataset: "Housing Maintenance Code Violations",
            recordType: "violation",
            category: "mold",
            status: "open",
            recordDate: new Date("2026-02-21T00:00:00Z"),
          },
        ],
      },
      admin._id,
    );

    const building2 = await createBuilding(
      {
        buildingName: "Riverside Court",
        streetAddress: "455 Riverside Dr",
        borough: "Manhattan",
        neighborhood: "Hamilton Heights",
        zipCode: "10031",
        bin: "1000002",
        bbl: "1012340002",
        ownerName: "Riverside Homes Inc",
        managerName: "Metro Property Services",
        riskSummary: {
          highlights: ["Bedbug history reported in prior year"],
          lastCalculatedAt: new Date("2026-03-08T10:30:00Z"),
        },
        housingRecords: [
          {
            sourceDataset: "Bedbug Reporting",
            recordType: "bedbug report",
            category: "bedbugs",
            status: "resolved",
            recordDate: new Date("2025-11-15T00:00:00Z"),
          },
          {
            sourceDataset: "Housing Maintenance Code Complaints and Problems",
            recordType: "complaint",
            category: "repairs",
            status: "closed",
            recordDate: new Date("2026-01-18T00:00:00Z"),
          },
        ],
      },
      admin._id,
    );

    const building3 = await createBuilding(
      {
        buildingName: "Brooklyn Terrace",
        streetAddress: "88 Flatbush Ave",
        borough: "Brooklyn",
        neighborhood: "Downtown Brooklyn",
        zipCode: "11217",
        bin: "2000001",
        bbl: "3012340001",
        ownerName: "Brooklyn Terrace Group",
        managerName: "Harbor Management NYC",
        riskSummary: {
          highlights: ["Litigation activity on record"],
          lastCalculatedAt: new Date("2026-03-05T09:00:00Z"),
        },
        housingRecords: [
          {
            sourceDataset: "Housing Litigations",
            recordType: "litigation",
            category: "tenant action",
            status: "open",
            recordDate: new Date("2026-02-12T00:00:00Z"),
          },
          {
            sourceDataset: "Housing Maintenance Code Violations",
            recordType: "violation",
            category: "elevator",
            status: "resolved",
            recordDate: new Date("2026-01-28T00:00:00Z"),
          },
        ],
      },
      admin._id,
    );

    const building4 = await createBuilding(
      {
        buildingName: "Queens Garden Plaza",
        streetAddress: "240-15 Union Tpke",
        borough: "Queens",
        neighborhood: "Bayside",
        zipCode: "11364",
        bin: "4000001",
        bbl: "4012340001",
        ownerName: "Queens Garden Realty",
        managerName: "Eastborough Residential",
        riskSummary: {
          highlights: ["Low recent complaint volume"],
          lastCalculatedAt: new Date("2026-03-01T08:45:00Z"),
        },
        housingRecords: [
          {
            sourceDataset: "Multiple Dwelling Registrations",
            recordType: "registration",
            category: "registration active",
            status: "active",
            recordDate: new Date("2026-01-01T00:00:00Z"),
          },
        ],
      },
      admin._id,
    );

    console.log("Buildings seeded.");

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
