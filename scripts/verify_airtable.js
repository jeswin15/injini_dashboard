
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
const base = Airtable.base(BASE_ID_1);

async function checkTable(tableName, limit = 1) {
    try {
        console.log(`\nChecking table: "${tableName}"...`);
        const records = await base(tableName).select({ maxRecords: limit }).firstPage();
        console.log(`✅ Success! Table "${tableName}" is accessible. Found ${records.length} records.`);
        if (records.length > 0) {
            records.forEach((r, i) => {
                console.log(`\n--- Record ${i + 1} Fields ---`);
                const filteredObj = {};
                for (let key in r.fields) {
                    if (key.toLowerCase().includes('school') || key.toLowerCase().includes('rural') || key.toLowerCase().includes('female') || key.toLowerCase().includes('disability')) {
                        filteredObj[key] = r.fields[key];
                    }
                }
                console.log("Found Matching Detailed Fields:", filteredObj);
                console.log("All raw keys:", Object.keys(r.fields).join(', '));
            });
        }
    } catch (error) {
        if (error.error === 'NOT_FOUND') {
            console.error(`❌ Table "${tableName}" NOT FOUND.`);
        } else {
            console.error(`❌ Error accessing "${tableName}":`, error.message || error);
        }
    }
}

async function run() {
    await checkTable('Monthly reporting', 10);
    await checkTable('Needs Assessment', 10);
    await checkTable('Post Program Reporting', 10);
}

run();
