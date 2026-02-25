import Airtable from 'airtable';
import 'dotenv/config';

const API_KEY = process.env.AIRTABLE_API_KEY || '';
const BASE_ID = 'app3KJMspt7z8qy9M'; // Cohort 2

Airtable.configure({ apiKey: API_KEY });

async function debugCohort2() {
    console.log('--- DEBUGGING COHORT 2 SCHEMA ---\n');
    const base = Airtable.base(BASE_ID);

    // 1. Try to fetch from 'Monthly reporting' (Exact Case)
    try {
        console.log("Attempting to fetch 'Monthly reporting'...");
        const records = await base('Monthly reporting').select({ maxRecords: 1 }).all();

        if (records.length > 0) {
            console.log("✅ Successfully fetched 'Monthly reporting'.");
            const record = records[0];
            console.log("\n--- FIELD NAMES FOUND ---");
            // Print all keys in the fields object
            Object.keys(record.fields).sort().forEach(key => {
                console.log(`- "${key}": ${JSON.stringify(record.get(key))}`);
            });
        } else {
            console.log("⚠️ Table 'Monthly reporting' found but returned 0 records.");
        }

    } catch (error: any) {
        console.error("❌ Error fetching 'Monthly reporting':", error.message);

        // If table not found, we can't easily list tables with the SDK, 
        // but the error message often suggests available logical names or we can infer it.
    }
}

debugCohort2();
