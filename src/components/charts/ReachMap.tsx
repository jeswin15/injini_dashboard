import React from 'react';
import { MapPin } from 'lucide-react';

export const ReachMap: React.FC = () => {
    return (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 h-full min-h-[200px] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/South_Africa_provinces_blank.svg/800px-South_Africa_provinces_blank.svg.png')] bg-contain bg-center bg-no-repeat"></div>

            <div className="z-10 text-center">
                <div className="bg-teal-50 p-3 rounded-full inline-flex mb-3">
                    <MapPin className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">School Reach Map</h3>
                <p className="text-sm text-gray-500 mt-1 max-w-[200px]">
                    Geospatial distribution of 70+ schools across South Africa.
                </p>
            </div>
        </div>
    );
};
