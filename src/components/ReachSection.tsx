import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import type { ReachData } from '../types/dashboard';
import { formatNumber } from '../utils/calculations';

interface ReachSectionProps {
    data: ReachData[];
}

export function ReachSection({ data }: ReachSectionProps) {
    // Use latest month data
    const latestData = data[data.length - 1] || {
        totalSubscribers: 0,
        newSubscribers: 0,
        totalSchools: 0,
        learners: 0
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Reach Indicators</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Subscribers */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Total Subscribers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatNumber(latestData.totalSubscribers)}</div>
                        <p className="text-xs text-gray-400 mt-1">Educators + Learners</p>
                    </CardContent>
                </Card>

                {/* New Subscribers */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">New Subscribers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">+{formatNumber(latestData.newSubscribers)}</div>
                        <p className="text-xs text-gray-400 mt-1">This Month</p>
                    </CardContent>
                </Card>

                {/* Total Schools */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Total Schools</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{latestData.totalSchools}</div>
                        <p className="text-xs text-gray-400 mt-1">Participating Institutions</p>
                    </CardContent>
                </Card>

                {/* Learners */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Total Learners</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600">{formatNumber(latestData.learners)}</div>
                        <p className="text-xs text-gray-400 mt-1">Active Students</p>
                    </CardContent>
                </Card>
            </div>

            {/* Placeholder for detailed reach/learner disaggregation if data becomes available */}
            <Card>
                <CardHeader>
                    <CardTitle>Learner Disaggregation</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-40 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <p className="text-gray-400">Detailed learner breakdown chart will appear here when data is available.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
