import React from 'react';
import { HiOutlineRefresh, HiHome, HiExclamation } from 'react-icons/hi';
import { MdOutlineBugReport } from 'react-icons/md';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an analytics service here
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F0F2F5] font-sans flex flex-col">
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="max-w-2xl w-full bg-white rounded-[24px] shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-8 md:p-12 text-center">
                
                {/* Visual Warning */}
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-25"></div>
                  <div className="relative w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
                    <HiExclamation size={44} />
                  </div>
                </div>

                <h1 className="text-3xl font-extrabold text-[#0D0E12] mb-3">
                  Something went wrong
                </h1>
                
                {/* Specific Permission/Error Message */}
                <div className="bg-amber-50 border-l-4 border-amber-400 p-5 mb-8 text-left">
                  <p className="text-amber-900 font-medium text-sm md:text-base italic">
                    "Maybe you don't have permission to access this resource, or a temporary technical glitch occurred."
                  </p>
                </div>

                <p className="text-gray-500 mb-10 max-w-sm mx-auto">
                  Don't worry, your data is safe. Try refreshing the page or returning to the main dashboard.
                </p>

                {/* Dashboard Theme Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button 
                    onClick={() => window.location.reload()}
                    className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3 bg-[#7C3AED] text-white font-bold rounded-xl hover:bg-[#6D28D9] shadow-lg shadow-purple-200 transition-all active:scale-95"
                  >
                    <HiOutlineRefresh size={20} />
                    Reload Page
                  </button>
                  
                  <a
                    href="/"
                    className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3 bg-white border-2 border-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all active:scale-95"
                  >
                    <HiHome size={20} />
                    Back to Home
                  </a>
                </div>
              </div>

              {/* Technical Support Footer */}
              <div className="bg-gray-50 p-6 flex flex-col sm:flex-row items-center justify-between border-t border-gray-100">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-4 sm:mb-0">
                  <MdOutlineBugReport size={18} />
                  <span>Reported to technical team</span>
                </div>
                <button className="text-[#7C3AED] text-sm font-bold hover:underline">
                  View error details
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;