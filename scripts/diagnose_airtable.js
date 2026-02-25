
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const API_KEY = envConfig.VITE_AIRTABLE_API_KEY;

console.log('--- Diagnostic: Inspecting Potential Data Tables ---');

async function inspectTable(baseId, tableName) {
    const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}?maxRecords=1`;

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log(`\n✅ Table: "${tableName}"`);
            if (data.records.length > 0) {
                console.log('Sample Record Fields:');
                const fields = Object.keys(data.records[0].fields);
                fields.forEach(f => console.log(`- ${f}: ${JSON.stringify(data.records[0].fields[f]).substring(0, 50)}...`));
            } else {
                console.log('⚠️  Table is empty.');
            }
        } else {
            console.log(`❌ Failed to access table "${tableName}". Status: ${response.status}`);
        }

    } catch (error) {
        console.error('Fetch error:', error);
    }
}

// Use Cohort 1 ID from previous success/env
const COHORT_1_ID = envConfig.VITE_AIRTABLE_BASE_ID_COHORT_1;
await inspectTable(COHORT_1_ID, 'Monthly reporting');

console.log('--- Diagnostic: Deep Inspect Grant Table ---');

async function inspectGrantTable(baseId) {
    const tableName = 'Grant';
    const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}?maxRecords=1`;

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log(`\n✅ Table: "${tableName}"`);
            if (data.records.length > 0) {
                console.log('All Record Fields:');
                const fields = Object.keys(data.records[0].fields);
                fields.forEach(f => console.log(`- ${f}`));
            } else {
                console.log('⚠️  Table is empty.');
            }
        } else {
            console.log(`❌ Failed to access table "${tableName}". Status: ${response.status}`);
        }

    } catch (error) {
        console.error('Fetch error:', error);
    }
}

console.log('--- Diagnostic: Checking for Specific Missing Fields ---');

async function checkMissingFields(baseId) {
    const tableName = 'Monthly reporting';
    const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}?maxRecords=3`; // Check 3 records to be safe

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log(`\n✅ Checking fields in "${tableName}"`);
            if (data.records.length > 0) {
                const allFields = new Set();
                data.records.forEach(r => Object.keys(r.fields).forEach(k => allFields.add(k)));

                console.log("Available Fields (Sample):", Array.from(allFields).sort().join(", "));

                const keywords = ['rural', 'disabilit', 'province', 'location', 'region', 'city', 'growth', 'logic'];
                console.log("\nSearching for keywords:", keywords.join(", "));

                keywords.forEach(kw => {
                    const matches = Array.from(allFields).filter(f => f.toLowerCase().includes(kw));
                    console.log(`- keyword "${kw}":`, matches.length > 0 ? matches : "Not found");
                });

            } else {
                console.log('⚠️  Table is empty.');
            }
        } else {
            console.log(`❌ Failed. Status: ${response.status}`);
        }

    } catch (error) {
        console.error('Fetch error:', error);
    }
}

console.log('--- Diagnostic: Listing All Tables in Base ---');
// Note: The metadata API isn't always available with PATs depending on scopes.
// We will try to fetch the base schema if possible, or just list the ones we know work.
// Actually, standard API doesn't list tables. We have to guess or use metadata API.
// Let's rely on what we found earlier + common guesses.

const KNOWN_TABLES = [
    'Monthly reporting',
    'Network & opportunity development',
    'Grant',
    'Fellows',
    'Startups',
    'Schools',
    'Programme Data'
];

async function checkCommonTables(baseId) {
    console.log(`Checking for common tables in Base ${baseId}...`);
    for (const table of KNOWN_TABLES) {
        await inspectTable(baseId, table);
    }
}

await checkCommonTables(COHORT_1_ID);

console.log('--- Diagnostic: Listing Bases ---');

async function listBases() {
    const url = `https://api.airtable.com/v0/meta/bases`;

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });

        console.log(`Status: ${response.status} ${response.statusText}`);

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Success! Found the following bases:');
            data.bases.forEach(b => console.log(`- ${b.name} (ID: ${b.id})`));
        } else {
            console.log('❌ Failed to list bases.');
            console.log('Reason:', response.statusText);
            if (response.status === 403) {
                console.log('💡 TIP: Your Personal Access Token is likely missing the "schema.bases:read" scope.');
            }
        }

    } catch (error) {
        console.error('Fetch error:', error);
    }
}

listBases();
