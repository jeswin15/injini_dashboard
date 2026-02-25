
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const API_KEY = envConfig.VITE_AIRTABLE_API_KEY;
const BASE_ID = envConfig.VITE_AIRTABLE_BASE_ID_COHORT_1;
const TABLE_NAME = envConfig.VITE_AIRTABLE_TABLE_SALES || 'Sales';

console.log(`Checking Base: ${BASE_ID}, Table: ${TABLE_NAME}`);

async function check() {
    const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}?maxRecords=1`;

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });

        console.log(`Status: ${response.status} ${response.statusText}`);

        const data = await response.json();
        console.log('Response Body:', JSON.stringify(data, null, 2));

    } catch (error) {
        console.error('Fetch error:', error);
    }
}

check();
