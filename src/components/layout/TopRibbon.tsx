import React from 'react';
import { ArrowUpRight, AlertTriangle, Users, BookOpen } from 'lucide-react';

interface MetricItemProps {
    label: string;
    value: string | number;
    subValue?: string;
    icon: React.ComponentType<any>;
    trend?: 'up' | 'down' | 'neutral';
    alert?: boolean;
}

const MetricItem: React.FC<MetricItemProps> = ({ label, value, subValue, icon: Icon, trend, alert }) => (
    <div className={`flex items-center space-x-4 px-6 py-3 border-r border-gray-200 last:border-0 ${alert ? 'bg-amber-50/50' : ''}`}>
        <div className={`p-2 rounded-full ${alert ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-600'}`}>
            <Icon className="w-5 h-5" />
        </div>
        <div>
            <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">{label}</p>
            <div className="flex items-baseline space-x-2">
                <span className="text-xl font-bold text-gray-800">{value}</span>
                {subValue && (
                    <span className={`text-xs font-medium flex items-center ${trend === 'up' ? 'text-green-500' : 'text-gray-400'}`}>
                        {trend === 'up' && <ArrowUpRight className="w-3 h-3 mr-0.5" />}
                        {subValue}
                    </span>
                )}
            </div>
        </div>
    </div>
);

export const TopRibbon: React.FC = () => {
    // TODO: Accept real props
    return (
        <div className="bg-white border-b border-gray-200 h-20 flex items-center shadow-sm sticky top-0 z-40 ml-64">
            <div className="flex-1 flex overflow-x-auto no-scrollbar">
                <MetricItem
                    label="Total Jobs Created"
                    value="1,245"
                    subValue="+12% vs LY"
                    icon={Users}
                    trend="up"
                />
                <MetricItem
                    label="Total Learner Reach"
                    value="850,000"
                    subValue="+5% MoM"
                    icon={BookOpen}
                    trend="up"
                />
                <MetricItem
                    label="Avg. Prog. Growth"
                    value="42%"
                    subValue="TWA"
                    icon={ArrowUpRight}
                    trend="up"
                />
                <MetricItem
                    label="Active Red Flags"
                    value="3"
                    icon={AlertTriangle}
                    alert={true}
                    subValue="Needs Attention"
                />
            </div>
        </div>
    );
};
