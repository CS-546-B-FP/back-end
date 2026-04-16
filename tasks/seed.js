import { dbConnection, closeConnection } from '../config/mongoConnection.js';
import { userData } from '../data/index.js';
import { buildings } from '../config/mongoCollections.js';

const seed = async () => {
  const db = await dbConnection();
  await db.dropDatabase();

  // Seed admin user
  await userData.createUser('Admin', 'User', 'admin@leasewise.com', 'admin', 'Admin1234!', 'admin');

  // Seed sample building
  const col = await buildings();
  await col.insertOne({
    buildingName: 'Sample Building',
    streetAddress: '100 Main St',
    borough: 'Manhattan',
    neighborhood: 'Midtown',
    zipCode: '10001',
    bin: '1000000',
    bbl: '1000000001',
    ownerName: 'Sample Owner LLC',
    managerName: 'Sample Management',
    riskSummary: { highlights: [], lastCalculatedAt: new Date() },
    housingRecords: [],
    createdByAdminId: null,
    updatedByAdminId: null,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  console.log('Seed complete.');
  await closeConnection();
};

seed().catch((e) => { console.error(e); process.exit(1); });
