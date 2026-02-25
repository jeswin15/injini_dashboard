import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    ReferenceArea
} from 'recharts';
import { MoreHorizontal, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/calculations';
import { cn } from '../../utils/cn';

import type { FellowData } from '../../types/dashboard';

interface GrowthCardProps {
    fellow: FellowData;
}

export const GrowthCard: React.FC<GrowthCardProps> = ({ fellow }) => {
    return (
        <div className={cn(
            "bg-white rounded-xl shadow-sm border p-5 transition-all w-full",
            fellow.hasRedFlag ? "border-amber-400 shadow-amber-100" : "border-gray-100"
        )}>
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">{fellow.companyName}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                        {/* Dynamic Logic Badge */}
                        <span className={cn(
                            "text-xs px-2 py-0.5 rounded border font-medium",
                            fellow.monthsOfData > 12 ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-blue-50 text-blue-700 border-blue-200"
                        )}>
                            Logic: {fellow.currentLogic}
                        </span>
                        {/* Months Data Badge */}
                        <span className="text-xs text-gray-400">
                            {fellow.monthsOfData} months data
                        </span>
                    </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal className="w-5 h-5" />
                </button>
            </div>

            {/* Logic Progress Bar */}
            <div className="w-full bg-gray-100 h-1.5 rounded-full mb-6 overflow-hidden">
                <div
                    className="bg-teal-500 h-full rounded-full"
                    style={{ width: `${Math.min((fellow.monthsOfData / 24) * 100, 100)}%` }}
                />
            </div>

            {/* Chart */}
            <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={fellow.data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis
                            dataKey="month"
                            tick={{ fontSize: 10, fill: '#9CA3AF' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        {/* Left Axis: Sales */}
                        <YAxis
                            yAxisId="left"
                            tick={{ fontSize: 10, fill: '#9CA3AF' }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) => `${value / 1000}k`}
                        />
                        {/* Right Axis: Profit */}
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            tick={{ fontSize: 10, fill: '#9CA3AF' }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) => `${value / 1000}k`}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            formatter={(value: any) => [formatCurrency(value), '']}
                            labelStyle={{ color: '#6B7280', fontSize: '0.75rem', marginBottom: '0.25rem' }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />

                        {/* Shaded Area for baseline comparison (first 3 months) */}
                        {fellow.data.length > 3 && (
                            <ReferenceArea x1={fellow.data[0].month} x2={fellow.data[2].month} yAxisId="left" fill="#F3F4F6" fillOpacity={0.5} />
                        )}

                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="sales"
                            stroke="#0F766E"
                            strokeWidth={2}
                            dot={{ r: 2, fill: '#0F766E' }}
                            activeDot={{ r: 4 }}
                            name="Sales"
                        />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="profit"
                            stroke="#F59E0B"
                            strokeWidth={2}
                            dot={{ r: 2, fill: '#F59E0B' }}
                            activeDot={{ r: 4 }}
                            name="Profit"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {fellow.hasRedFlag && (
                <div className="mt-4 flex items-center text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    <span>Negative growth detected in last quarter.</span>
                </div>
            )}
        </div>
    );
};
