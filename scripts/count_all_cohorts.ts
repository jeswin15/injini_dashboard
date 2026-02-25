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

async function countAllCohorts() {
    console.log('--- Counting Fellows Per Cohort ---\n');

    for (const [name, baseId] of Object.entries(COHORTS)) {
        const base = Airtable.base(baseId);
        const uniqueFellows = new Set<string>();

        try {
            const records = await base(TABLE_NAME).select().all();

            records.forEach(record => {
                const fellowName =
                    (record.get('Company name') as string) ||
                    (record.get('Business name') as string) ||
                    (record.get('Name') as string);

                if (fellowName) {
                    uniqueFellows.add(fellowName.trim());
                }
            });

            console.log(`[${name}]`);
            console.log(`Count: ${uniqueFellows.size}`);
            if (uniqueFellows.size > 0) {
                console.log(`Fellows: ${Array.from(uniqueFellows).sort().join(', ')}`);
            } else {
                console.log('Fellows: (None)');
            }
            console.log('-----------------------------------');

        } catch (error) {
            console.error(`Error fetching ${name}:`, error);
        }
    }
}

countAllCohorts();
