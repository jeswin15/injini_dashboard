import Airtable from 'airtable';
import 'dotenv/config';

const API_KEY = process.env.AIRTABLE_API_KEY || '';


const COHORTS = {
    'Cohort 1': 'app5MKMARnZAInXVJ',
    'Cohort 2': 'app3KJMspt7z8qy9M',
    'Cohort 3': 'appBhlIJDu8JvaWxB',
    'Cohort 4': 'appzHpcS4aenhjZ8V'
};

const TABLE_NAME = 'Monthly reporting';

Airtable.configure({ apiKey: API_KEY });

async function checkCohorts() {
    console.log('--- Starting Cohort Verification ---\n');

    for (const [name, baseId] of Object.entries(COHORTS)) {
        console.log(`Checking [${name}] (${baseId})...`);
        const base = Airtable.base(baseId);

        try {
            const records = await base(TABLE_NAME).select({ maxRecords: 1 }).all();

            if (records.length === 0) {
                console.log(`❌ [${name}] connected but found 0 records in '${TABLE_NAME}'.\n`);
                continue;
            }

            const firstRecord = records[0];
            const fields = Object.keys(firstRecord.fields);

            console.log(`✅ [${name}] Success! Found records.`);
            console.log(`   Sample Fields: ${fields.slice(0, 5).join(', ')}...`);

            // Check specific critical fields
            const criticalFields = ['Monthly Sales', 'Monthly net profit', 'Reporting month', 'Company name'];
            const missing = criticalFields.filter(f => !fields.includes(f));

            if (missing.length > 0) {
                console.log(`⚠️  WARNING: Missing critical fields in [${name}]: ${missing.join(', ')}`);
                console.log(`   Available fields: ${fields.join(', ')}`);
            } else {
                console.log(`   All critical fields present.`);
            }
            console.log('\n');

        } catch (error) {
            console.log(`❌ [${name}] Failed to fetch. Error: ${error.message}\n`);
        }
    }
}

checkCohorts();
