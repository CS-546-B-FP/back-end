import { buildings } from '../config/mongoCollections.js';

const computeRiskScore = (building) => {
  return (
    building.complaintsCount * 1 +
    building.violationsCount * 2 +
    building.bedbugCount * 3 +
    building.litigationsCount * 4
  );
};

export const runRiskRecalculation = async () => {
  const col = await buildings();
  const all = await col.find({}).toArray();

  const now = new Date();

  const ops = all.map((b) => {
    const riskScore = computeRiskScore(b);

    let riskLevel = 'Low';
    if (riskScore >= 15) riskLevel = 'High';
    else if (riskScore >= 6) riskLevel = 'Medium';

    return col.updateOne(
      { _id: b._id },
      {
        $set: {
          riskScore,
          riskLevel,
          'riskSummary.lastCalculatedAt': now
        }
      }
    );
  });

  await Promise.all(ops);

  console.log(`[risk-recalculation] recalculated ${all.length} buildings`);
};

export const startRiskRecalculation = (intervalMs = 60 * 1000) => {
  runRiskRecalculation().catch(console.error);

  // 60 * 1000 ms periodic running
  setInterval(() => {
    runRiskRecalculation().catch(console.error);
  }, intervalMs);
};