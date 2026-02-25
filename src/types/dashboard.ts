export type Cohort = 'Cohort 1' | 'Cohort 2' | 'Cohort 3' | 'Cohort 4';

export interface DataIssue {
    cohort: string;
    table: string;
    field: string;
    issue: 'missing' | 'fallback_used' | 'missing_identifier';
    details: string;
}

export interface BusinessData {
    month: string;
    sales: number;
    profit: number;
    salesGrowth: number;
    profitGrowth: number;
    investment: number;
}

export interface JobData {
    month: string;
    totalJobs: number;
    newJobs: number;
    newFemaleJobs: number;
    youthJobs: number;
}

export interface ReachData {
    month: string;
    totalSubscribers: number;
    newSubscribers: number;
    totalSchools: number;
    learners: number;
}

export interface InvestmentItem {
    fellowName: string;
    amount: number;
    monthSecured: string;
    investor: string;
    cohort: Cohort;
}

export interface FellowData {
    companyName: string;
    cohort: string;
    monthsOfData: number;
    currentLogic: 'Logic i' | 'Logic ii' | 'Logic iii';
    data: {
        month: string;
        date: Date; // For sorting
        sales: number;
        profit: number;
        totalJobs: number;
        youthJobs: number;
        femaleJobs: number;
        // Reach Data
        totalSubscribers: number;
        newSubscribers: number;
        newLearners: number;
        newEducators: number;
        learners: number;
        educators: number;
        schools: number;
        q1_3_schools: number;
        saSchools: number;
        femaleLearners: number;
        ruralLearners: number;
    }[];
    hasRedFlag: boolean;
}

export interface DashboardData {
    business: BusinessData[];
    jobs: JobData[];
    reach: ReachData[];
    issues?: DataIssue[];
}
