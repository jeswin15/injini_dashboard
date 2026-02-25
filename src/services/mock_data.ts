import type { DashboardData } from '../types/dashboard';

// Mock Data for initial development and fallback
export const MOCK_DATA: DashboardData = {
    business: [
        { month: 'Jan', sales: 120000, profit: 45000, salesGrowth: 12, profitGrowth: 8, investment: 500000 },
        { month: 'Feb', sales: 135000, profit: 52000, salesGrowth: 15, profitGrowth: 10, investment: 0 },
        { month: 'Mar', sales: 150000, profit: 58000, salesGrowth: 18, profitGrowth: 12, investment: 250000 },
        { month: 'Apr', sales: 160000, profit: 62000, salesGrowth: 10, profitGrowth: 9, investment: 0 },
        { month: 'May', sales: 175000, profit: 70000, salesGrowth: 22, profitGrowth: 15, investment: 1000000 },
    ],
    jobs: [
        { month: 'Jan', totalJobs: 50, newJobs: 5, newFemaleJobs: 3, youthJobs: 4 },
        { month: 'Feb', totalJobs: 55, newJobs: 5, newFemaleJobs: 2, youthJobs: 3 },
        { month: 'Mar', totalJobs: 62, newJobs: 7, newFemaleJobs: 4, youthJobs: 5 },
        { month: 'Apr', totalJobs: 68, newJobs: 6, newFemaleJobs: 3, youthJobs: 4 },
        { month: 'May', totalJobs: 75, newJobs: 7, newFemaleJobs: 5, youthJobs: 6 },
    ],
    reach: [
        { month: 'Jan', totalSubscribers: 1000, newSubscribers: 100, totalSchools: 50, learners: 5000 },
        { month: 'Feb', totalSubscribers: 1150, newSubscribers: 150, totalSchools: 55, learners: 5500 },
        { month: 'Mar', totalSubscribers: 1350, newSubscribers: 200, totalSchools: 60, learners: 6200 },
        { month: 'Apr', totalSubscribers: 1500, newSubscribers: 150, totalSchools: 62, learners: 6800 },
        { month: 'May', totalSubscribers: 1800, newSubscribers: 300, totalSchools: 70, learners: 8000 },
    ]
};
