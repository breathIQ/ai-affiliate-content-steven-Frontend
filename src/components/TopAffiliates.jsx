import { useState } from "react";

const affiliates = [
  {
    name: "John Doe",
    email: "johndoe@gmail.com",
    value: "3,412",
    growth: "+18%",
  },
  {
    name: "John Doe",
    email: "johndoe@gmail.com",
    value: "3,412",
    growth: "+18%",
  },
  {
    name: "John Doe",
    email: "johndoe@gmail.com",
    value: "3,412",
    growth: "+18%",
  },
  {
    name: "John Doe",
    email: "johndoe@gmail.com",
    value: "3,412",
    growth: "+18%",
  },
];

const tabs = [
  { id: "published", label: "Published", icon: "/icons/ic-posts.svg" },
  { id: "generated", label: "Generated", icon: "/icons/ic-generate.svg" },
  { id: "clicks", label: "Clicks", icon: "/icons/ic-click.svg" },
  // { id: "conversion", label: "Conversion", icon:"/icons/ic-conversion.svg" },
];

export default function TopAffiliates({ details }) {
  const [activeTab, setActiveTab] = useState("published");

  // console.log("top_affiliates" ,details?.top_affiliates)
  const affiliateList = details?.top_affiliates?.[activeTab] || [];

  return (
    <div className="bg-white rounded-xl shadow p-5 w-full">
      <h2 className="text-sm font-semibold mb-4">Top Performing Affiliates</h2>

      <div className="flex gap-4 mb-3">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative w-28 h-24 rounded-xl border-2 
              ${
                isActive
                  ? "border-transparent"
                  : "border-dashed border-gray-200"
              }
              flex flex-col items-center justify-center gap-2
              text-sm font-medium transition`}
            >
              {/* Icon */}
              <div
                className={`text-lg ${
                  isActive ? "text-purple-600" : "text-gray-400"
                }`}
              >
                <img src={tab.icon} />
                {/* {tab.icon} */}
              </div>

              {/* Label */}
              <span
                className={`${isActive ? "text-gray-900" : "text-gray-500"}`}
              >
                {tab.label}
              </span>

              {/* Active underline */}
              {isActive && (
                <span className="absolute bottom-0 left-4 right-4 h-1 bg-purple-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      <div className="space-y-4 py-4">
        {affiliateList.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-gray-400">
            {/* Simple Empty Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1}
              stroke="currentColor"
              className="w-16 h-16 mb-4 opacity-20"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900">No user found</h3>
            <p className="text-sm mt-1">Try adjusting your filters.</p>
          </div>
        ) : (
          <>
            {affiliateList.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      item?.avatar_url ||
                      `https://i.pravatar.cc/40?img=${i + 10}`
                    }
                    alt={item.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.email}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold">{item.total}</p>
                  {/* <span className="text-xs text-green-500">{item.growth}</span> */}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
