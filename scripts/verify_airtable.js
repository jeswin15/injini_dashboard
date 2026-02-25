
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
async function checkTable(base, tableName, cohortName, limit = 1) {
    try {
        console.log(`\nChecking table: "${tableName}" in ${cohortName}...`);
        const records = await base(tableName).select({ maxRecords: limit }).firstPage();
        console.log(`✅ Success! Table "${tableName}" is accessible. Found ${records.length} records.`);
        if (records.length > 0) {
            records.forEach((r, i) => {
                const filteredObj = {};
                for (let key in r.fields) {
                    if (key.toLowerCase().includes('school') || key.toLowerCase().includes('rural') || key.toLowerCase().includes('female') || key.toLowerCase().includes('disability') || key.toLowerCase().includes('q1')) {
                        filteredObj[key] = r.fields[key];
                    }
                }
                if (Object.keys(filteredObj).length > 0) {
                    console.log(`--- Record ${i + 1} Matching Fields ---`, filteredObj);
                }
            });
            // Print all keys of first record just to be sure
            console.log("\nAll raw keys (Record 1):", Object.keys(records[0].fields).join(', '));
        }
    } catch (error) {
        if (error.error === 'NOT_FOUND') {
            console.log(`❌ Table "${tableName}" NOT FOUND in ${cohortName}.`);
        } else {
            console.error(`❌ Error accessing "${tableName}" in ${cohortName}:`, error.message || error);
        }
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
        await checkTable(base, 'Monthly reporting', cohortName, 5);
        await checkTable(base, 'Needs Assessment', cohortName, 5);
        await checkTable(base, 'Post Program Reporting', cohortName, 5);
    }
}

run();
