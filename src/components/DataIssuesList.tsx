import React from 'react';
import type { DataIssue } from '../types/dashboard';
import { AlertTriangle } from 'lucide-react';

interface DataIssuesListProps {
    issues: DataIssue[];
}

export const DataIssuesList: React.FC<DataIssuesListProps> = ({ issues }) => {
    if (issues.length === 0) return null;

    return (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mt-8">
            <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
                <h3 className="text-lg font-bold text-amber-900">Data Fetching Issues</h3>
            </div>
            <div className="max-h-60 overflow-y-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-amber-800 uppercase bg-amber-100">
                        <tr>
                            <th className="p-2">Cohort</th>
                            <th className="p-2">Table</th>
                            <th className="p-2">Issue</th>
                            <th className="p-2">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-200">
                        {issues.map((issue, idx) => (
                            <tr key={idx} className="hover:bg-amber-100">
                                <td className="p-2 font-medium text-amber-900">{issue.cohort}</td>
                                <td className="p-2 text-amber-800">{issue.table}</td>
                                <td className="p-2 text-amber-800">{issue.issue}</td>
                                <td className="p-2 text-amber-700 font-mono text-xs">{issue.details}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
