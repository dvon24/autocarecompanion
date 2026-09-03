import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { VEHICLE_TWIN_CATALOG } from '../src/lib/vehicle-twin-catalog';

dotenv.config({ path:'.env.local', override:true, quiet:true });

function contiguousRuns(input: number[]): number[][] {
  const years = [...new Set(input)].sort((a, b) => a - b);
  const runs: number[][] = [];
  for (const year of years) {
    const current = runs.at(-1);
    if (!current || year > (current.at(-1) ?? year) + 1) runs.push([year]);
    else current.push(year);
  }
  return runs;
}

function generationEstimate(models: Map<string, number[]>, yearsPerGeneration = 6): number {
  return [...models.values()].reduce((total, years) => total + contiguousRuns(years)
    .reduce((subtotal, run) => subtotal + Math.ceil(run.length / yearsPerGeneration), 0), 0);
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');
  const pool = new Pool({ connectionString:process.env.DATABASE_URL, max:1 });
  const prisma = new PrismaClient({ adapter:new PrismaPg(pool) });
  try {
    const issues = await prisma.knownIssue.findMany({
      where:{ status:'published', vehicleType:'car' },
      select:{ make:true, model:true, years:true },
    });
    const models = new Map<string, number[]>();
    for (const issue of issues) {
      const key = `${issue.make}|||${issue.model}`;
      models.set(key, [...(models.get(key) ?? []), ...issue.years]);
    }
    const existing = new Set(VEHICLE_TWIN_CATALOG.map((twin) => `${twin.identity.make}|||${twin.identity.model}`));
    const coveredNameplates = [...models.keys()].filter((key) => existing.has(key)).length;
    const modernEntries: Array<[string, number[]]> = [...models].map(([key, years]) => [key, years.filter((year) => year >= 1990)]);
    const modern = new Map<string, number[]>(modernEntries.filter(([, years]) => years.length > 0));
    console.log(JSON.stringify({
      measuredAt:new Date().toISOString(),
      publishedCarIssues:issues.length,
      distinctMakeModelPages:models.size,
      currentTwinDefinitions:VEHICLE_TWIN_CATALOG.length,
      currentTwinNameplatesInCatalog:coveredNameplates,
      minimumAdditionalNameplateBuilds:models.size - coveredNameplates,
      contiguousYearRuns:[...models.values()].reduce((sum, years) => sum + contiguousRuns(years).length, 0),
      sixYearBodyGenerationPlanningEstimate:generationEstimate(models),
      sixYearBodyGenerationPlanningEstimateSince1990:generationEstimate(modern),
      note:'US-only access is a customer geography rule. KnownIssue has no sales-market field, so it cannot safely reduce artwork scope by vehicle market.',
    }, null, 2));
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
