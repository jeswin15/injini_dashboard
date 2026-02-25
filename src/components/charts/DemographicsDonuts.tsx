import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DemographicsDonutsProps {
    femalePct: number;
    ruralPct: number;
    disabilityPct: number;
}

const SimpleDonut = ({ data, title, percentage }: { data: any[], title: string, percentage: string }) => (
    <div className="flex flex-col items-center">
        <div className="relative h-32 w-32">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        innerRadius={25}
                        outerRadius={40}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip cursor={false} />
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-sm font-bold text-gray-700">{percentage}</span>
            </div>
        </div>
        <span className="text-sm font-medium text-gray-600 mt-2">{title}</span>
    </div>
);

export const DemographicsDonuts: React.FC<DemographicsDonutsProps> = ({ femalePct, ruralPct, disabilityPct }) => {
    const dataFemale = [
        { name: 'Female', value: femalePct, color: '#0F766E' },
        { name: 'Male/Other', value: 100 - femalePct, color: '#E5E7EB' },
    ];

    const dataRural = [
        { name: 'Rural', value: ruralPct, color: '#F59E0B' },
        { name: 'Urban', value: 100 - ruralPct, color: '#E5E7EB' },
    ];

    const dataDisability = [
        { name: 'Disability', value: disabilityPct, color: '#EF4444' },
        { name: 'None/Not Tracked', value: 100 - disabilityPct, color: '#E5E7EB' },
    ];

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
            <h4 className="text-sm font-semibold text-gray-500 mb-6 uppercase">Aggregated Cohort Distribution</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <SimpleDonut data={dataFemale} title="% Female" percentage={`${femalePct}%`} />
                <SimpleDonut data={dataRural} title="% Rural" percentage={`${ruralPct}%`} />
                <SimpleDonut data={dataDisability} title="% Disability" percentage={disabilityPct > 0 ? `${disabilityPct}%` : 'N/A'} />
            </div>
        </div>
    );
};
