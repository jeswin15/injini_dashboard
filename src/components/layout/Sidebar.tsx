import React from 'react';
import { Users, Database, Settings } from 'lucide-react';
// import { cn } from '../../utils/cn';

// Simple cn utility replacement if not exists, but usually I'd check. 
// For safety, I'll use standard className strings or template literals defined here.
const navItems = [
    { name: 'Cohort 1', icon: Users, id: 'Cohort 1' },
    { name: 'Cohort 2', icon: Users, id: 'Cohort 2' },
    { name: 'Cohort 3', icon: Users, id: 'Cohort 3' },
    { name: 'Cohort 4', icon: Users, id: 'Cohort 4' },
    { name: 'Overall', icon: Database, id: 'Overall' },
];

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
    return (
        <div className="w-64 bg-[#1A2B3C] text-white flex flex-col h-screen fixed left-0 top-0 z-50">
            {/* Logo Area */}
            <div className="h-16 flex items-center px-6 border-b border-gray-700">
                <span className="text-xl font-bold tracking-wider text-teal-400">INJINI</span>
                <span className="ml-2 text-sm font-light text-gray-300">IMPACT</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-2">
                {navItems.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center px-3 py-3 rounded-lg transition-all duration-200 group ${isActive
                                ? 'bg-teal-500/10 text-teal-400 border-r-2 border-teal-400'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-teal-400' : 'text-gray-500 group-hover:text-white'}`} />
                            <span className="text-sm font-medium">{item.name}</span>
                        </button>
                    );
                })}
            </nav>

            {/* Footer / Settings */}
            <div className="p-4 border-t border-gray-700">
                <button className="flex items-center text-gray-500 hover:text-white transition-colors w-full">
                    <Settings className="w-5 h-5 mr-3" />
                    <span className="text-sm">Settings</span>
                </button>
                <div className="mt-4 text-xs text-gray-600">
                    v1.0.0 | Connected to Airtable
                </div>
            </div>
        </div>
    );
};
