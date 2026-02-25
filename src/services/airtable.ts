import Airtable from 'airtable';
import type { DashboardData, InvestmentItem, FellowData, DataIssue } from '../types/dashboard';
import { MOCK_DATA } from './mock_data';

const API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY;
const BASE_IDS = {
    'Cohort 1': import.meta.env.VITE_AIRTABLE_BASE_ID_COHORT_1,
    'Cohort 2': import.meta.env.VITE_AIRTABLE_BASE_ID_COHORT_2,
    'Cohort 3': import.meta.env.VITE_AIRTABLE_BASE_ID_COHORT_3,
    'Cohort 4': import.meta.env.VITE_AIRTABLE_BASE_ID_COHORT_4,
};

// Configure Airtable
Airtable.configure({
    apiKey: API_KEY,
});

// Table mappings from .env
const TABLE_SALES = import.meta.env.VITE_AIRTABLE_TABLE_SALES;
const TABLE_PROFIT = import.meta.env.VITE_AIRTABLE_TABLE_PROFIT;
const TABLE_JOBS = import.meta.env.VITE_AIRTABLE_TABLE_JOBS;
const TABLE_REACH = import.meta.env.VITE_AIRTABLE_TABLE_REACH;
const TABLE_INVESTMENT = import.meta.env.VITE_AIRTABLE_TABLE_INVESTMENT;

// Helper to parse "Report 6 - September 2023" into "Sep 2023" or just "Sep"
const parseMonth = (rawMonth: string): string => {
    if (!rawMonth) return 'Unknown';
    const parts = rawMonth.split('-');
    if (parts.length > 1) {
        const datePart = parts[parts.length - 1].trim(); // "September 2023"
        const date = new Date(datePart);
        if (!isNaN(date.getTime())) {
            return date.toLocaleString('default', { month: 'short' });
        }
    }
    return rawMonth;
};

// Helper to parse sorting index from "Report 6 - September..." -> 6
const parseMonthIndex = (rawMonth: string): number => {
    if (!rawMonth) return 0;
    const match = rawMonth.match(/Report (\d+)/i);
    return match ? parseInt(match[1], 10) : 0;
}

// SMART FIELD ACCESSOR
// Returns { value, usedField }
const getSmartValue = (record: any, fields: string[]): { value: any, usedField: string | null } => {
    for (const field of fields) {
        const val = record.get(field);
        if (val !== undefined && val !== null) {
            // Handle Rollups/Lookups which might be arrays [10] instead of 10
            if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'number') {
                return { value: val[0], usedField: field };
            }
            // Handle string arrays if expecting string? 
            if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'string') {
                // But wait, if we expect a number and get ["10"], we might need parsing. 
                // For now, let's just return the first item if it's an array, let the caller cast.
                return { value: val[0], usedField: field };
            }
            return { value: val, usedField: field };
        }
    }
    return { value: undefined, usedField: null };
};


export const fetchDashboardData = async (useMock = false): Promise<DashboardData> => {
    if (useMock) {
        return new Promise((resolve) => {
            setTimeout(() => resolve(MOCK_DATA), 1000);
        });
    }

    const aggData: Record<string, any> = {};
    const issues: DataIssue[] = [];
    const bases = Object.entries(BASE_IDS);

    const uniqueTables = new Set([
        TABLE_SALES,
        TABLE_PROFIT,
        TABLE_JOBS,
        TABLE_REACH,
        'Needs Assessment',
        'Post Program Reporting'
    ]);

    for (const [cohortName, baseId] of bases) {
        const base = Airtable.base(baseId);

        for (const tableName of uniqueTables) {
            try {
                const records = await base(tableName).select().all();

                records.forEach(record => {
                    // Smart Month Fetch
                    // Also check for 'Date' (common in other tables)
                    const monthRes = getSmartValue(record, ['Reporting month', 'Reporting Month', 'Date']);
                    const rawMonth = monthRes.value as string;

                    if (!rawMonth) {
                        // Only log issue if it's strictly missing and we expected it
                        return;
                    }

                    // Log if we used a fallback (Alerting)
                    if (monthRes.usedField !== 'Reporting month') {
                        // We could log this, but maybe too noisy for month. 
                        // Let's focus on Business Metrics.
                    }



                    const month = parseMonth(rawMonth);
                    const monthIndex = parseMonthIndex(rawMonth);

                    if (!aggData[month]) {
                        aggData[month] = {
                            month,
                            monthIndex,
                            sales: 0,
                            profit: 0,
                            totalJobs: 0,
                            newFemaleJobs: 0,
                            youthJobs: 0,
                            totalSubscribers: 0,
                            newSubscribers: 0,
                            learners: 0
                        };
                    }

                    if (tableName === TABLE_SALES) {
                        const salesRes = getSmartValue(record, ['Monthly Sales', 'Monthly sales']);
                        const val = (salesRes.value as number) || 0;
                        aggData[month].sales += val;

                        if (val === 0 && salesRes.usedField === null) {
                            // Potentially missing data
                            // Note: 0 is valid, so be careful. But undefined means field missing.
                        }
                    }
                    if (tableName === TABLE_PROFIT) {
                        const profitRes = getSmartValue(record, ['Monthly net profit', 'Monthly Net Profit']);
                        aggData[month].profit += (profitRes.value as number) || 0;
                    }
                    if (tableName === TABLE_JOBS) {
                        const opJobs = (record.get('Operational jobs - Total') as number) || 0;
                        const eduJobs = (record.get('Educational resourcing jobs -Total') as number) || 0;
                        aggData[month].totalJobs += opJobs + eduJobs;

                        const opFemale = (record.get('Operational jobs - female') as number) || 0;
                        const eduFemale = (record.get('Educational resourcing jobs - Female') as number) || 0;
                        aggData[month].newFemaleJobs += opFemale + eduFemale;

                        aggData[month].youthJobs += (record.get('Youth operational jobs') as number) || 0;
                    }
                    if (tableName === TABLE_REACH) {
                        // Reach fields have significant variations
                        const subRes = getSmartValue(record, ['Total Subscribers -Students', 'Total Subscribers - Students']);
                        aggData[month].totalSubscribers += (subRes.value as number) || 0;

                        const newSubRes = getSmartValue(record, ['Net new monthly subscribers  - students', 'New Monthly Subscribers - Students']);
                        aggData[month].newSubscribers += (newSubRes.value as number) || 0;

                        const learnRes = getSmartValue(record, ['Active users Students - Broad Definition', 'Monthly Active users - Students', 'Monthly Active users - Students ']);
                        aggData[month].learners += (learnRes.value as number) || 0;
                    }
                });

            } catch (error) {
                console.error(`Error fetching table "${tableName}" from base ${baseId}:`, error);
                issues.push({
                    cohort: cohortName,
                    table: tableName,
                    field: 'ALL',
                    issue: 'missing',
                    details: `Could not access table. Check permissions or table name.`
                });
            }
        }
    }

    // Convert Aggregated Data to Arrays and Sort
    const sortedMonths = Object.values(aggData).sort((a, b) => a.monthIndex - b.monthIndex);

    const business = sortedMonths.map((d, index, arr) => {
        const prevSales = index > 0 ? arr[index - 1].sales : d.sales;
        const prevProfit = index > 0 ? arr[index - 1].profit : d.profit;

        return {
            month: d.month,
            sales: d.sales,
            profit: d.profit,
            salesGrowth: prevSales ? ((d.sales - prevSales) / prevSales) * 100 : 0,
            profitGrowth: prevProfit ? ((d.profit - prevProfit) / prevProfit) * 100 : 0,
            investment: 0
        };
    });

    const jobs = sortedMonths.map((d, index, arr) => {
        const prevJobs = index > 0 ? arr[index - 1].totalJobs : 0;
        return {
            month: d.month,
            totalJobs: d.totalJobs,
            newJobs: Math.max(0, d.totalJobs - prevJobs),
            newFemaleJobs: d.newFemaleJobs,
            youthJobs: d.youthJobs
        };
    });

    const reach = sortedMonths.map(d => ({
        month: d.month,
        totalSubscribers: d.totalSubscribers,
        newSubscribers: d.newSubscribers,
        totalSchools: 0,
        learners: d.learners
    }));

    return { business, jobs, reach, issues };
};

export const fetchInvestments = async (useMock = false): Promise<InvestmentItem[]> => {
    // ... (investment implementation remains similar, but using smart fetching if needed)
    // For brevity, keeping it simple as it was less problematic in tests
    if (useMock) {
        return MOCK_DATA.business
            .filter(b => b.investment > 0)
            .map((b, i) => ({
                fellowName: `Fellow ${i + 1}`,
                amount: b.investment,
                monthSecured: b.month,
                investor: 'Mock Investor',
                cohort: 'Cohort 1'
            }));
    }

    const investments: InvestmentItem[] = [];
    const bases = Object.entries(BASE_IDS);

    for (const [cohortName, baseId] of bases) {
        const base = Airtable.base(baseId);
        try {
            const records = await base(TABLE_INVESTMENT).select({
                filterByFormula: "{Connection type} = 'Investment/ funding'"
            }).all();

            records.forEach(record => {
                const fellowRaw = record.get('Company name (fellow)');
                const fellowName = Array.isArray(fellowRaw) ? fellowRaw[0] : (fellowRaw as string) || 'Unknown Fellow';
                const date = (record.get('Date') as string) || '';
                const investor = (record.get('Company/ person name (Connection)') as string) || 'Unknown Investor';
                const amount = (record.get('Amount') as number) || (record.get('Value') as number) || 0;

                investments.push({
                    fellowName,
                    amount,
                    monthSecured: date,
                    investor,
                    cohort: cohortName as any
                });
            });

        } catch (error) {
            console.error(`Error fetching investments from base ${baseId}:`, error);
        }
    }

    return investments;
}

// CHANGED: Returns object with data AND issues
export const fetchFellowsData = async (useMock = false): Promise<{ fellows: FellowData[], issues: DataIssue[] }> => {
    if (useMock) {
        return { fellows: [], issues: [] }; // Mock cleanup
    }

    const fellowsMap: Record<string, FellowData> = {};
    const issues: DataIssue[] = [];
    const bases = Object.entries(BASE_IDS);

    for (const [cohortName, baseId] of bases) {
        const base = Airtable.base(baseId);
        const tableName = import.meta.env.VITE_AIRTABLE_TABLE_SALES || 'Monthly reporting';

        try {
            const records = await base(tableName).select().all();

            records.forEach(record => {
                const nameRes = getSmartValue(record, ['Company name', 'Business name', 'Name', 'Fellow', 'Startup', 'Company']);
                const companyName = nameRes.value as string;

                // Debugging helper for Schools tables
                if (tableName === 'Needs Assessment' || tableName === 'Post Program Reporting' || tableName === 'Monthly reporting') {
                    if (!companyName) {
                        issues.push({
                            cohort: cohortName,
                            table: tableName,
                            field: 'Company Name',
                            issue: 'missing_identifier',
                            details: `Missing Company Name. Record Keys: ${Object.keys(record.fields).join(', ')}`
                        });
                    }
                }

                if (!companyName) return;

                // Log if we had to use a fallback (Self-Correction/Alerting mechanism)
                if (nameRes.usedField && nameRes.usedField !== 'Company name') {
                    // We only log this ONCE per cohort to avoid spamming issues
                    const issueId = `${cohortName}-fieldname-${nameRes.usedField}`;
                    if (!issues.find(i => i.details.includes(issueId))) {
                        issues.push({
                            cohort: cohortName,
                            table: tableName,
                            field: 'Company Name',
                            issue: 'fallback_used',
                            details: `Auto-corrected: Used '${nameRes.usedField}' instead of 'Company name' (${issueId})`
                        });
                    }
                }

                const monthRes = getSmartValue(record, ['Reporting month', 'Reporting Month', 'Date']);
                const rawMonth = monthRes.value as string;
                const month = parseMonth(rawMonth);

                // Date Parsing for Sorting
                let uniqueDate = new Date();
                if (rawMonth) {
                    const parts = rawMonth.split('-');
                    if (parts.length > 1) {
                        const datePart = parts[parts.length - 1].trim();
                        const parsed = new Date(datePart);
                        if (!isNaN(parsed.getTime())) uniqueDate = parsed;
                    } else {
                        const parsed = new Date(rawMonth);
                        if (!isNaN(parsed.getTime())) uniqueDate = parsed;
                    }
                }

                if (!fellowsMap[companyName]) {
                    fellowsMap[companyName] = {
                        companyName,
                        cohort: cohortName,
                        monthsOfData: 0,
                        currentLogic: 'Logic i',
                        data: [],
                        hasRedFlag: false
                    };
                }

                const salesRes = getSmartValue(record, ['Monthly Sales', 'Monthly sales']);
                const profitRes = getSmartValue(record, ['Monthly net profit', 'Monthly Net Profit']);

                const sales = (salesRes.value as number) || 0;
                const profit = (profitRes.value as number) || 0;

                // Jobs Data
                const opJobs = (record.get('Operational jobs - Total') as number) || 0;
                const eduJobs = (record.get('Educational resourcing jobs -Total') as number) || 0;
                const totalJobs = opJobs + eduJobs;

                const opFemale = (record.get('Operational jobs - female') as number) || 0;
                const eduFemale = (record.get('Educational resourcing jobs - Female') as number) || 0;
                const femaleJobs = opFemale + eduFemale; // Total female jobs snapshot

                const youthJobs = (record.get('Youth operational jobs') as number) || 0;

                // Reach Data
                const subRes = getSmartValue(record, ['Total Subscribers -Students', 'Total Subscribers - Students']);
                const learners = (subRes.value as number) || 0;

                const eduRes = getSmartValue(record, ['Total Subscribers - Educators', 'Total Subscribers -Educators']);
                const educators = (eduRes.value as number) || 0;

                const totalSubscribers = learners + educators;

                const newSubRes = getSmartValue(record, ['Net new monthly subscribers  - students', 'New Monthly Subscribers - Students']);
                const newSubscribers = (newSubRes.value as number) || 0;

                // Proxy logic: If we don't have separate "New Learners" vs "New Educators", 
                // we assume most new subscribers are learners.
                // Or check for specific educator growth if available.
                // For now, mapping New Subs -> New Learners approx.
                const newLearners = newSubscribers;
                const newEducators = 0; // Field likely missing or needs specific calc across months.

                const schoolRes = getSmartValue(record, [
                    'Schools reached',
                    'Total Schools',
                    'Number of schools/learning institutions where EdTech solutions are being tested'
                ]);
                const schools = (schoolRes.value as number) || 0;

                const q13Res = getSmartValue(record, [
                    'Q1-3 Schools',
                    'Quintile 1-3 schools',
                    'Quintile 1-3 Schools Students subscriptions',
                    'Number of Quintile 1-3 schools'
                ]);
                const q1_3_schools = (q13Res.value as number) || 0;

                const saSchoolsRes = getSmartValue(record, ['Number of South African schools']);
                const saSchools = (saSchoolsRes.value as number) || 0;

                // Demographics (Often percentage or raw number? Assuming Raw Number for now based on context)
                // If fields are missing in some cohorts, we might need more smart fetching or defaults.
                // Checking previous agg logic: it didn't fetch demographics per fellow.
                // We'll try to find common names.
                const femaleLearnRes = getSmartValue(record, ['Female learners', 'Female Users', 'Total Subscribers - Female']);
                const femaleLearners = (femaleLearnRes.value as number) || 0;

                const ruralRes = getSmartValue(record, ['Rural learners', 'Rural Users']);
                const ruralLearners = (ruralRes.value as number) || 0;

                fellowsMap[companyName].data.push({
                    month,
                    date: uniqueDate,
                    sales,
                    profit,
                    totalJobs,
                    femaleJobs,
                    youthJobs,
                    totalSubscribers,
                    newSubscribers,
                    newLearners,
                    newEducators,
                    learners,
                    educators,
                    schools,
                    q1_3_schools,
                    saSchools,
                    femaleLearners,
                    ruralLearners
                });

                fellowsMap[companyName].monthsOfData += 1;
            });

        } catch (error) {
            console.error(`Error fetching fellows from ${cohortName}:`, error);
            issues.push({
                cohort: cohortName,
                table: tableName,
                field: 'ALL',
                issue: 'missing',
                details: `Failed to fetch fellow data.`
            });
        }
    }

    // Process logic/red flags
    const fellows = Object.values(fellowsMap).map(fellow => {
        // SORT Data Chronologically
        fellow.data.sort((a, b) => a.date.getTime() - b.date.getTime());

        if (fellow.monthsOfData > 18) fellow.currentLogic = 'Logic iii';
        else if (fellow.monthsOfData > 6) fellow.currentLogic = 'Logic ii';

        const lastMonth = fellow.data[fellow.data.length - 1];
        if (lastMonth && lastMonth.profit < 0) {
            fellow.hasRedFlag = true;
        }

        return fellow;
    });

    return { fellows, issues };
};
