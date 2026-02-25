
import Airtable from 'airtable';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

// Manually load env since we are running a script
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

for (const k in envConfig) {
    process.env[k] = envConfig[k];
}

const API_KEY = process.env.VITE_AIRTABLE_API_KEY;
const BASE_ID_1 = process.env.VITE_AIRTABLE_BASE_ID_COHORT_1;

const TABLES = [
    process.env.VITE_AIRTABLE_TABLE_SALES || 'Sales',
    process.env.VITE_AIRTABLE_TABLE_PROFIT || 'Profit',
    process.env.VITE_AIRTABLE_TABLE_JOBS || 'Jobs',
    process.env.VITE_AIRTABLE_TABLE_REACH || 'Reach',
    process.env.VITE_AIRTABLE_TABLE_INVESTMENT || 'Investment'
];

console.log('--- Verifying Airtable Connection ---');
console.log('API Key present:', !!API_KEY);
console.log('Base ID Cohort 1:', BASE_ID_1);

if (!API_KEY || !BASE_ID_1) {
    console.error('Missing API Key or Base ID in .env');
    process.exit(1);
}

Airtable.configure({ apiKey: API_KEY });
let grandTotalSASchools = 0;
let grandTotalQ13Schools = 0;

const cohortTotals = {
    'Cohort 1': { sa: 0, q13: 0 },
    'Cohort 2': { sa: 0, q13: 0 },
    'Cohort 3': { sa: 0, q13: 0 },
    'Cohort 4': { sa: 0, q13: 0 },
};

async function checkTable(base, tableName, cohortName, limit = 100) {
    try {
        const records = await base(tableName).select({ maxRecords: limit }).firstPage();
        if (records.length > 0) {
            records.forEach((r, i) => {
                const saSchools = r.get('Number of South African schools') ||
                    r.get('Number of South African schools solution is being used/tested in') ||
                    r.get('Subscription - South African schools') || 0;

                const q13Schools = r.get('Q1-3 Schools') ||
                    r.get('Quintile 1-3 schools') ||
                    r.get('Quintile 1-3 Schools Students subscriptions') ||
                    r.get('Number of Quintile 1-3 schools') ||
                    r.get('Number of Quintile 1 - 3 schools') ||
                    r.get('Number Quintile 1 - 3 schools ') ||
                    r.get('Subscription - Q1-3 schools') || 0;

                grandTotalSASchools += saSchools;
                grandTotalQ13Schools += q13Schools;
                if (cohortTotals[cohortName]) {
                    cohortTotals[cohortName].sa += saSchools;
                    cohortTotals[cohortName].q13 += q13Schools;
                }
            });
        }
    } catch (error) {
        // ignore not found
    }
}

async function run() {
    const bases = {
        'Cohort 1': process.env.VITE_AIRTABLE_BASE_ID_COHORT_1,
        'Cohort 2': process.env.VITE_AIRTABLE_BASE_ID_COHORT_2,
        'Cohort 3': process.env.VITE_AIRTABLE_BASE_ID_COHORT_3,
        'Cohort 4': process.env.VITE_AIRTABLE_BASE_ID_COHORT_4,
    };

    for (const [cohortName, baseId] of Object.entries(bases)) {
        if (!baseId) continue;
        const base = Airtable.base(baseId);
        await checkTable(base, 'Monthly reporting', cohortName, 100);
        await checkTable(base, 'Needs Assessment', cohortName, 100);
        await checkTable(base, 'Post Program Reporting', cohortName, 100);
        await checkTable(base, 'Post-Program Reporting', cohortName, 100);
    }

    console.log("---- DATABASE TOTALS BY COHORT ----");
    for (const cohort of Object.keys(cohortTotals)) {
        console.log(`\n${cohort}:`);
        console.log(`  South African Schools: ${cohortTotals[cohort].sa}`);
        console.log(`  Quintile 1-3 Schools: ${cohortTotals[cohort].q13}`);
    }

    console.log("\n---- GRAND TOTALS ----");
    console.log("Total South African Schools:", grandTotalSASchools);
    console.log("Total Quintile 1-3 Schools:", grandTotalQ13Schools);
}

run();
