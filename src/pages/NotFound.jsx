import React from 'react';
import { HiLockClosed, HiChevronLeft } from 'react-icons/hi';
import { RiDashboardLine } from 'react-icons/ri';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#F0F2F5] font-sans text-[#1A1C1E]">
    
      {/* Main Content Area */}
      <div className="flex flex-col items-center justify-center py-20 px-4">
        
        {/* Main Error Card - Matches Dashboard Card Style */}
        <div className="max-w-2xl w-full bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-10 text-center">
            
            {/* Visual Element */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-50 text-indigo-600 rounded-2xl mb-6">
              <HiLockClosed size={40} />
            </div>

            <h1 className="text-6xl font-black text-[#0D0E12] mb-2">404</h1>
            <h2 className="text-2xl font-bold text-[#1A1C1E] mb-4">Page Not Found</h2>
            
            {/* Permission Message - Styled like your card descriptions */}
            <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-dashed border-gray-300">
              <p className="text-gray-600 text-lg italic">
                "Maybe you don't have permission to access this resource. Please contact your administrator if you believe this is an error."
              </p>
            </div>

            {/* Actions - Using your Purple button theme */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => window.history.back()}
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
              >
                <HiChevronLeft size={20} />
                Go Back
              </button>
              
              <a
                href="/dashboard"
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3 bg-[#7C3AED] text-white font-semibold rounded-xl hover:bg-[#6D28D9] shadow-lg shadow-indigo-100 transition-all"
              >
                <RiDashboardLine size={20} />
                Return to Dashboard
              </a>
            </div>
          </div>
          
          {/* Bottom decorative bar matching your progress bar color */}
          <div className="h-2 w-full bg-[#E5E7EB]">
            <div className="h-full bg-gradient-to-r from-[#7C3AED] to-[#A855F7] w-1/3"></div>
          </div>
        </div>

        {/* Support Link */}
        <p className="mt-8 text-gray-500 text-sm">
          Need help? <a href="#" className="text-[#7C3AED] font-medium hover:underline">Contact Support Team</a>
        </p>
      </div>
    </div>
  );
};

export default NotFound;