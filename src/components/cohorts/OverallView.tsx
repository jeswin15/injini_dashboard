import React, { useEffect, useState } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { fetchFellowsData } from '../../services/airtable';
import type { FellowData } from '../../types/dashboard';
import { formatCurrency } from '../../utils/calculations';

const COHORTS = ['Cohort 1', 'Cohort 2', 'Cohort 3', 'Cohort 4'];

export const OverallView: React.FC = () => {
    const [fellows, setFellows] = useState<FellowData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetchFellowsData(false);
                setFellows(res.fellows);
            } catch (error) {
                console.error("Failed to load overall data", error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return <div className="p-10 text-center text-gray-500">Loading Overall Comparison...</div>;

    // Aggregate Data by Cohort for Comparison Table
    const cohortSummaries = COHORTS.map(cohortName => {
        const cohortFellows = fellows.filter(f => f.cohort === cohortName);

        // Summing latest values or flows
        let currentTotalJobs = 0;
        let newJobsCreated = 0;
        let newFemaleJobs = 0;
        let youthJobs = 0;
        let totalLearners = 0;
        let totalEducators = 0;
        let newLearners = 0;
        let newEducators = 0;
        let totalSubscribers = 0;
        let saSchools = 0;
        let q1_3_schools = 0;
        let salesTotal = 0;
        let profitTotal = 0;
        let totalInitialJobs = 0; // For pct calculation

        cohortFellows.forEach(f => {
            if (f.data.length > 0) {
                const current = f.data[f.data.length - 1];
                const first = f.data[0];

                currentTotalJobs += current.totalJobs;
                newJobsCreated += (current.totalJobs - first.totalJobs);
                newFemaleJobs += (current.femaleJobs - first.femaleJobs);
                youthJobs += current.youthJobs;
                totalInitialJobs += first.totalJobs;

                totalLearners += current.learners || 0;
                totalEducators += current.educators || 0;
                saSchools += current.saSchools || 0;
                q1_3_schools += current.q1_3_schools || 0;
                totalSubscribers += current.totalSubscribers || 0;

                newLearners += f.data.reduce((acc, d) => acc + (d.newLearners || 0), 0);
                newEducators += f.data.reduce((acc, d) => acc + (d.newEducators || 0), 0);

                salesTotal += f.data.reduce((acc, d) => acc + d.sales, 0);
                profitTotal += f.data.reduce((acc, d) => acc + d.profit, 0);
            }
        });

        const percentChangeJobs = totalInitialJobs > 0 ? (newJobsCreated / totalInitialJobs) * 100 : 0;

        return {
            name: cohortName,
            currentTotalJobs,
            newJobsCreated,
            percentChangeJobs,
            newFemaleJobs,
            youthJobs,
            totalLearners,
            totalEducators,
            newLearners,
            newEducators,
            totalSubscribers,
            saSchools,
            q1_3_schools,
            salesTotal,
            profitTotal
        };
    });

    // Program Totals
    const programTotal = cohortSummaries.reduce((acc, c) => ({
        ...acc,
        currentTotalJobs: acc.currentTotalJobs + c.currentTotalJobs,
        newJobsCreated: acc.newJobsCreated + c.newJobsCreated,
        newFemaleJobs: acc.newFemaleJobs + c.newFemaleJobs,
        youthJobs: acc.youthJobs + c.youthJobs,
        totalLearners: acc.totalLearners + c.totalLearners,
        totalEducators: acc.totalEducators + c.totalEducators,
        newLearners: acc.newLearners + c.newLearners,
        newEducators: acc.newEducators + c.newEducators,
        totalSubscribers: acc.totalSubscribers + c.totalSubscribers,
        saSchools: acc.saSchools + c.saSchools,
        q1_3_schools: acc.q1_3_schools + c.q1_3_schools,
        salesTotal: acc.salesTotal + c.salesTotal,
        profitTotal: acc.profitTotal + c.profitTotal,
    }), {
        name: 'Total Overall',
        currentTotalJobs: 0, newJobsCreated: 0, newFemaleJobs: 0, youthJobs: 0,
        totalLearners: 0, totalEducators: 0, newLearners: 0, newEducators: 0,
        totalSubscribers: 0, saSchools: 0, q1_3_schools: 0, salesTotal: 0, profitTotal: 0
    });

    const sumInitialJobs = fellows.reduce((sum, f) => f.data.length > 0 ? sum + f.data[0].totalJobs : sum, 0);
    const overallPctChange = sumInitialJobs > 0 ? (programTotal.newJobsCreated / sumInitialJobs) * 100 : 0;

    return (
        <div className="space-y-12">
            <h2 className="text-3xl font-bold text-gray-800 border-b pb-4">Overall Program Comparison</h2>

            <section>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Sales vs Profit Comparison across Cohorts */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
                        <h4 className="text-sm font-semibold text-gray-500 mb-4 uppercase">Sales & Profit by Cohort (Total to Date)</h4>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={cohortSummaries}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `R${val / 1000000}m`} />
                                <Tooltip formatter={(val: any) => formatCurrency(val)} cursor={{ fill: '#F9FAFB' }} />
                                <Legend />
                                <Bar dataKey="salesTotal" name="Sales" fill="#0F766E" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="profitTotal" name="Profit" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Jobs Comparison across Cohorts */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
                        <h4 className="text-sm font-semibold text-gray-500 mb-4 uppercase">Total Jobs Created by Cohort</h4>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={cohortSummaries} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" axisLine={false} tickLine={false} />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: '#F9FAFB' }} />
                                <Legend />
                                <Bar dataKey="currentTotalJobs" name="Total Jobs" fill="#0EA5E9" radius={[0, 4, 4, 0]} barSize={20} />
                                <Bar dataKey="newJobsCreated" name="New Jobs Added" fill="#10B981" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </section>

            {/* Master Comparison Matrix */}
            <section>
                <h3 className="text-2xl font-semibold text-gray-700 mb-6">Master Comparison Matrix</h3>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-600 font-bold border-b">
                            <tr>
                                <th className="p-4 border-r w-1/4">Metric</th>
                                {COHORTS.map(c => <th key={c} className="p-4 text-right border-r">{c}</th>)}
                                <th className="p-4 text-right bg-indigo-50 text-indigo-900 border-l">Overall Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            <tr className="bg-gray-100/50"><td colSpan={6} className="p-3 pl-4 font-bold text-gray-800">Jobs</td></tr>
                            {[
                                { key: 'currentTotalJobs', label: 'Total Jobs (at current)' },
                                { key: 'newJobsCreated', label: 'New Jobs Created' },
                                { key: 'percentChangeJobs', label: 'Percent Change Jobs', suffix: '%' },
                                { key: 'newFemaleJobs', label: 'New Female Jobs' },
                                { key: 'youthJobs', label: 'Youth Jobs' }
                            ].map(row => (
                                <tr key={row.key} className="hover:bg-gray-50">
                                    <td className="p-3 pl-8 text-gray-600 font-medium border-r">{row.label}</td>
                                    {cohortSummaries.map(c => (
                                        <td key={c.name} className="p-3 text-right border-r">
                                            {row.key === 'percentChangeJobs' ? (c[row.key as keyof typeof c] as number).toFixed(1) : (c[row.key as keyof typeof c] as number).toLocaleString()}
                                            {row.suffix}
                                        </td>
                                    ))}
                                    <td className="p-3 text-right bg-indigo-50 font-bold">
                                        {row.key === 'percentChangeJobs' ? overallPctChange.toFixed(1) : (programTotal[row.key as keyof typeof programTotal] as number).toLocaleString()}
                                        {row.suffix}
                                    </td>
                                </tr>
                            ))}

                            <tr className="bg-gray-100/50"><td colSpan={6} className="p-3 pl-4 font-bold text-gray-800">Solutions Reached</td></tr>
                            {[
                                { key: 'totalSubscribers', label: 'Total Subscribers' },
                                { key: 'totalLearners', label: 'Total Learners' },
                                { key: 'totalEducators', label: 'Total Educators' },
                                { key: 'newLearners', label: 'New Learners' },
                                { key: 'newEducators', label: 'New Educators' },
                                { key: 'saSchools', label: 'South African Schools' },
                                { key: 'q1_3_schools', label: 'Q1-3 Schools' }
                            ].map(row => (
                                <tr key={row.key} className="hover:bg-gray-50">
                                    <td className="p-3 pl-8 text-gray-600 font-medium border-r">{row.label}</td>
                                    {cohortSummaries.map(c => (
                                        <td key={c.name} className="p-3 text-right border-r">
                                            {(c[row.key as keyof typeof c] as number).toLocaleString()}
                                        </td>
                                    ))}
                                    <td className="p-3 text-right bg-indigo-50 font-bold">
                                        {(programTotal[row.key as keyof typeof programTotal] as number).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};
