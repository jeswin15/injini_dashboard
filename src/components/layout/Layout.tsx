import React from 'react';
import { Sidebar } from './Sidebar';
import { TopRibbon } from './TopRibbon';

interface LayoutProps {
    children: React.ReactNode;
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {

    return (
        <div className="bg-[#F4F7F6] min-h-screen font-sans">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Top Ribbon is sticky and positioned with ml-64 to sit next to sidebar */}
            <TopRibbon />

            <main className="ml-64 p-8">
                {/* Pass activeTab awareness to children if needed, or handle routing here. 
            For now, we just render children which will likely be the dashboard content.
            In a real app, 'activeTab' might drive the Router or conditional rendering here.
        */}
                <div className="max-w-7xl mx-auto">
                    {/* Header for the current view */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-800">
                            {activeTab === 'overview' && 'Programme Overview'}
                            {activeTab === 'cohorts' && 'Cohort Analytics'}
                            {activeTab === 'drilldown' && 'Fellow Drilldown'}
                            {activeTab === 'status' && 'Data Source Status'}
                        </h1>
                        <p className="text-gray-500 mt-1">Welcome to the Fellowship Impact Portal.</p>
                    </div>

                    {/* Content */}
                    <div className="space-y-6">
                        {/* Temporary: conditional rendering for demo purposes if children are not handling it */}
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};
