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
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import type { JobData } from '../types/dashboard';

interface JobsSectionProps {
    data: JobData[];
}

export function JobsSection({ data }: JobsSectionProps) {
    // Calculate totals from the latest month (last entry)
    const latestData = data[data.length - 1] || { totalJobs: 0, newJobs: 0, newFemaleJobs: 0, youthJobs: 0 };
    const previousData = data[data.length - 2] || { totalJobs: 0 };

    const totalJobs = latestData.totalJobs;
    const newJobs = latestData.newJobs;
    const percentChange = previousData.totalJobs > 0
        ? ((totalJobs - previousData.totalJobs) / previousData.totalJobs) * 100
        : 0;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Jobs Indicators</h2>

            {/* Key Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Total Jobs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalJobs}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">New Jobs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">+{newJobs}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">New Female Jobs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-pink-600">+{latestData.newFemaleJobs}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">% Change Jobs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${percentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {percentChange > 0 ? '+' : ''}{percentChange.toFixed(1)}%
                        </div>
                        <p className="text-xs text-gray-400 mt-1">vs last month</p>
                    </CardContent>
                </Card>
            </div>

            {/* Jobs Graph */}
            <Card>
                <CardHeader>
                    <CardTitle>Jobs Growth</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend />
                                <Bar dataKey="totalJobs" name="Total Jobs" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="newJobs" name="New Jobs" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
