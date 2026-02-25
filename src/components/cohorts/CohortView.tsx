import React, { useEffect, useState } from 'react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { fetchFellowsData, fetchInvestments } from '../../services/airtable';
import type { FellowData, InvestmentItem } from '../../types/dashboard';
import { formatCurrency } from '../../utils/calculations';
import { DemographicsDonuts } from '../charts/DemographicsDonuts';

interface CohortViewProps {
    cohortName: string;
}

const calculateJobsPerFellow = (data: FellowData['data']) => {
    if (data.length === 0) return {
        currentTotalJobs: 0, newJobsCreated: 0, percentChange: 0, newFemaleJobs: 0, youthJobs: 0
    };
    const first = data[0];
    const current = data[data.length - 1];

    const newJobsCreated = current.totalJobs - first.totalJobs;
    const percentChange = first.totalJobs > 0 ? (newJobsCreated / first.totalJobs) * 100 : 0;
    const newFemaleJobs = current.femaleJobs - first.femaleJobs;
    const newYouthJobs = current.youthJobs - first.youthJobs;

    return {
        currentTotalJobs: current.totalJobs,
        newJobsCreated,
        percentChange,
        newFemaleJobs,
        youthJobs: newYouthJobs
    };
};

const calculateReachData = (fellows: FellowData[]) => {
    let totalLearners = 0;
    let totalEducators = 0;
    let newLearners = 0;
    let newEducators = 0;
    let saSchools = 0;
    let q1_3_schools = 0;

    fellows.forEach(f => {
        let maxLearners = 0;
        let maxEducators = 0;
        let maxSaSchools = 0;
        let maxQ13Schools = 0;

        if (f.data.length > 0) {
            f.data.forEach(d => {
                if ((d.learners || 0) > maxLearners) maxLearners = d.learners;
                if ((d.educators || 0) > maxEducators) maxEducators = d.educators;
                if ((d.saSchools || 0) > maxSaSchools) maxSaSchools = d.saSchools;
                if ((d.q1_3_schools || 0) > maxQ13Schools) maxQ13Schools = d.q1_3_schools;
            });

            totalLearners += maxLearners;
            totalEducators += maxEducators;
            saSchools += maxSaSchools;
            q1_3_schools += maxQ13Schools;

            const newL = f.data.reduce((acc, d) => acc + (d.newLearners || 0), 0);
            const newE = f.data.reduce((acc, d) => acc + (d.newEducators || 0), 0);
            newLearners += newL;
            newEducators += newE;
        }
    });

    return { totalLearners, totalEducators, newLearners, newEducators, saSchools, q1_3_schools };
};

export const CohortView: React.FC<CohortViewProps> = ({ cohortName }) => {
    const [fellows, setFellows] = useState<FellowData[]>([]);
    const [investments, setInvestments] = useState<InvestmentItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [fellowsRes, invRes] = await Promise.all([
                    fetchFellowsData(false),
                    fetchInvestments(false)
                ]);
                const cohortFellows = fellowsRes.fellows.filter(f => f.cohort === cohortName);
                const cohortInvestments = invRes.filter(inv => inv.cohort === cohortName);

                setFellows(cohortFellows);
                setInvestments(cohortInvestments);
            } catch (error) {
                console.error("Failed to load cohort data", error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [cohortName]);

    if (loading) return <div className="p-10 text-center text-gray-500">Loading {cohortName}...</div>;

    // Time Series Aggregation
    const timeSeriesMap: Record<string, any> = {};
    let cumulativeNewSubscribers = 0;

    // Ordered months. If data is not sorted, this might need sorting logic.
    // Assuming months arrive in somewhat chronological order per fellow.
    const monthOrder: string[] = [];

    fellows.forEach(f => {
        f.data.forEach(d => {
            if (!timeSeriesMap[d.month]) {
                timeSeriesMap[d.month] = {
                    month: d.month,
                    sales: 0,
                    profit: 0,
                    totalJobs: 0,
                    femaleJobs: 0,
                    youthJobs: 0,
                    totalSubscribers: 0,
                    newSubscribers: 0,
                    schools: 0,
                };
                if (!monthOrder.includes(d.month)) monthOrder.push(d.month);
            }
            timeSeriesMap[d.month].sales += d.sales;
            timeSeriesMap[d.month].profit += d.profit;
            timeSeriesMap[d.month].totalJobs += d.totalJobs;
            timeSeriesMap[d.month].femaleJobs += d.femaleJobs;
            timeSeriesMap[d.month].youthJobs += d.youthJobs;
            timeSeriesMap[d.month].totalSubscribers += d.totalSubscribers;
            timeSeriesMap[d.month].newSubscribers += d.newSubscribers;
            timeSeriesMap[d.month].schools += d.schools;
        });
    });

    const graphData = monthOrder.map(m => {
        cumulativeNewSubscribers += timeSeriesMap[m].newSubscribers;
        return {
            ...timeSeriesMap[m],
            cumulativeNewSubscribers
        };
    });

    const reachSums = calculateReachData(fellows);

    // Demographics Aggregation
    let totalCurrentLearners = 0;
    let totalFemaleLearners = 0;
    let totalRuralLearners = 0;
    let totalDisabilityLearners = 0;

    fellows.forEach(f => {
        if (f.data.length > 0) {
            let maxLearners = 0;
            let maxFemale = 0;
            let maxRural = 0;
            let maxDisability = 0;

            f.data.forEach(d => {
                if ((d.learners || 0) > maxLearners) maxLearners = d.learners;
                if ((d.femaleLearners || 0) > maxFemale) maxFemale = d.femaleLearners;
                if ((d.ruralLearners || 0) > maxRural) maxRural = d.ruralLearners;
                if ((d.disabilityLearners || 0) > maxDisability) maxDisability = d.disabilityLearners;
            });

            totalCurrentLearners += maxLearners;
            totalFemaleLearners += maxFemale;
            totalRuralLearners += maxRural;
            totalDisabilityLearners += maxDisability;
        }
    });

    const femalePct = totalCurrentLearners > 0 ? Math.round((totalFemaleLearners / totalCurrentLearners) * 100) : 0;
    const ruralPct = totalCurrentLearners > 0 ? Math.round((totalRuralLearners / totalCurrentLearners) * 100) : 0;
    const disabilityPct = totalCurrentLearners > 0 ? Math.round((totalDisabilityLearners / totalCurrentLearners) * 100) : 0;

    return (
        <div className="space-y-12">
            <h2 className="text-3xl font-bold text-gray-800 border-b pb-4">{cohortName} Dashboard</h2>

            {/* 1. Business Health */}
            <section>
                <h3 className="text-2xl font-semibold text-gray-700 mb-6">Business Health</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
                        <h4 className="text-sm font-semibold text-gray-500 mb-4 uppercase">Sales Growth</h4>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={graphData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `R${v / 1000}k`} />
                                <Tooltip formatter={(v: any) => formatCurrency(v)} />
                                <Legend />
                                <Line type="monotone" dataKey="sales" name="Sales" stroke="#0F766E" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
                        <h4 className="text-sm font-semibold text-gray-500 mb-4 uppercase">Profit Growth</h4>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={graphData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `R${v / 1000}k`} />
                                <Tooltip formatter={(v: any) => formatCurrency(v)} />
                                <Legend />
                                <Line type="monotone" dataKey="profit" name="Profit" stroke="#F59E0B" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </section>

            {/* 2. Jobs */}
            <section>
                <h3 className="text-2xl font-semibold text-gray-700 mb-6">Jobs</h3>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96 mb-8">
                    <h4 className="text-sm font-semibold text-gray-500 mb-4 uppercase">Jobs Over Time</h4>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={graphData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="totalJobs" name="Total Jobs" fill="#0EA5E9" />
                            <Bar dataKey="femaleJobs" name="Female Jobs" fill="#A855F7" />
                            <Bar dataKey="youthJobs" name="Youth Jobs" fill="#F59E0B" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600 font-bold border-b">
                            <tr>
                                <th className="p-4">Fellow Name</th>
                                <th className="p-4 text-right">Total Jobs (Current)</th>
                                <th className="p-4 text-right">New Job Created</th>
                                <th className="p-4 text-right">Percent Change Jobs</th>
                                <th className="p-4 text-right">New Female Jobs</th>
                                <th className="p-4 text-right">Youth Jobs</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {fellows.map((f, i) => {
                                const m = calculateJobsPerFellow(f.data);
                                return (
                                    <tr key={i} className="hover:bg-gray-50">
                                        <td className="p-4 font-medium">{f.companyName}</td>
                                        <td className="p-4 text-right">{m.currentTotalJobs}</td>
                                        <td className="p-4 text-right">{m.newJobsCreated}</td>
                                        <td className="p-4 text-right">{m.percentChange.toFixed(1)}%</td>
                                        <td className="p-4 text-right">{m.newFemaleJobs}</td>
                                        <td className="p-4 text-right">{m.youthJobs}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* 3. Investments */}
            <section>
                <h3 className="text-2xl font-semibold text-gray-700 mb-6">Investments</h3>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600 font-bold border-b">
                            <tr>
                                <th className="p-4">Fellow Name</th>
                                <th className="p-4 text-right">Rand Value</th>
                                <th className="p-4">Investor Name</th>
                                <th className="p-4">Month</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {investments.length > 0 ? investments.map((inv, i) => (
                                <tr key={i} className="hover:bg-gray-50">
                                    <td className="p-4 font-medium">{inv.fellowName}</td>
                                    <td className="p-4 text-right text-emerald-600 font-semibold">{formatCurrency(inv.amount)}</td>
                                    <td className="p-4">{inv.investor}</td>
                                    <td className="p-4">{inv.monthSecured}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan={4} className="p-4 text-center text-gray-500">No investments recorded</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* 4. Solutions Reached */}
            <section>
                <h3 className="text-2xl font-semibold text-gray-700 mb-6">Solutions Reached</h3>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl border border-gray-100 text-center shadow-sm">
                        <p className="text-sm text-gray-500 font-semibold mb-1">Total Learners</p>
                        <p className="text-2xl font-bold text-gray-800">{reachSums.totalLearners.toLocaleString()}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-100 text-center shadow-sm">
                        <p className="text-sm text-gray-500 font-semibold mb-1">Total Educators</p>
                        <p className="text-2xl font-bold text-gray-800">{reachSums.totalEducators.toLocaleString()}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-100 text-center shadow-sm">
                        <p className="text-sm text-gray-500 font-semibold mb-1">New Learners</p>
                        <p className="text-2xl font-bold text-indigo-600">+{reachSums.newLearners.toLocaleString()}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-100 text-center shadow-sm">
                        <p className="text-sm text-gray-500 font-semibold mb-1">New Educators</p>
                        <p className="text-2xl font-bold text-indigo-600">+{reachSums.newEducators.toLocaleString()}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-100 text-center shadow-sm">
                        <p className="text-sm text-gray-500 font-semibold mb-1">South African Schools</p>
                        <p className="text-2xl font-bold text-emerald-600">{reachSums.saSchools.toLocaleString()}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-100 text-center shadow-sm">
                        <p className="text-sm text-gray-500 font-semibold mb-1">Q1-3 Schools</p>
                        <p className="text-2xl font-bold text-amber-600">{reachSums.q1_3_schools.toLocaleString()}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
                        <h4 className="text-sm font-semibold text-gray-500 mb-4 uppercase">Total Subscribers</h4>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={graphData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => v.toLocaleString()} />
                                <Tooltip />
                                <Line type="monotone" dataKey="totalSubscribers" stroke="#3B82F6" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
                        <h4 className="text-sm font-semibold text-gray-500 mb-4 uppercase">New Subscribers (Cumulative)</h4>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={graphData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => v.toLocaleString()} />
                                <Tooltip />
                                <Line type="monotone" dataKey="cumulativeNewSubscribers" stroke="#8B5CF6" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
                        <h4 className="text-sm font-semibold text-gray-500 mb-4 uppercase">Total Schools</h4>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={graphData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Line type="monotone" dataKey="schools" stroke="#10B981" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </section>

            {/* 5. Learner Disaggregation */}
            <section>
                <h3 className="text-2xl font-semibold text-gray-700 mb-6">Learner Disaggregation</h3>

                <DemographicsDonuts
                    femalePct={femalePct}
                    ruralPct={ruralPct}
                    disabilityPct={disabilityPct}
                />

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600 font-bold border-b">
                            <tr>
                                <th className="p-4">Fellow Name</th>
                                <th className="p-4 text-right">Female (%) / Count</th>
                                <th className="p-4 text-right">Rural (%) / Count</th>
                                <th className="p-4 text-right">Learner with disability</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {fellows.map((f, i) => {
                                let fCount = 0;
                                let rCount = 0;
                                let dCount = 0;
                                // Disaggregation data is often scattered. We take the maximum reported ever.
                                if (f.data.length > 0) {
                                    f.data.forEach(d => {
                                        if ((d.femaleLearners || 0) > fCount) fCount = d.femaleLearners;
                                        if ((d.ruralLearners || 0) > rCount) rCount = d.ruralLearners;
                                        if ((d.disabilityLearners || 0) > dCount) dCount = d.disabilityLearners;
                                    });
                                }
                                return (
                                    <tr key={i} className="hover:bg-gray-50">
                                        <td className="p-4 font-medium">{f.companyName}</td>
                                        <td className="p-4 text-right">{fCount.toLocaleString()}</td>
                                        <td className="p-4 text-right">{rCount.toLocaleString()}</td>
                                        <td className="p-4 text-right">{dCount.toLocaleString()}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};
