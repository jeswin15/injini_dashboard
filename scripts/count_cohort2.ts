import Airtable from 'airtable';
import 'dotenv/config';

const API_KEY = process.env.AIRTABLE_API_KEY || '';
const BASE_ID = 'app3KJMspt7z8qy9M'; // Cohort 2
const TABLE_NAME = 'Monthly reporting';

Airtable.configure({ apiKey: API_KEY });

async function countFellows() {
    console.log('Counting Fellows in Cohort 2...');
    const base = Airtable.base(BASE_ID);
    const uniqueFellows = new Set();

    try {
        const records = await base(TABLE_NAME).select().all();

        records.forEach(record => {
            // Apply the same fallback logic as src/services/airtable.ts
            const name =
                (record.get('Company name') as string) ||
                (record.get('Business name') as string) ||
                (record.get('Name') as string);

            if (name) {
                uniqueFellows.add(name);
            }
        });

        console.log(`\nTotal Records: ${records.length}`);
        console.log(`Unique Fellows: ${uniqueFellows.size}`);
        console.log('List of Fellows:', Array.from(uniqueFellows).sort().join(', '));

    } catch (error) {
        console.error('Error:', error);
    }
}

countFellows();
