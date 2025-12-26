import { useState } from "react";
import { useNavigate } from "react-router-dom";

const tabs = ["dashboard", "users", "files"];

export default function TopNavTabs() {
  const [active, setActive] = useState("Users");
  const navigate = useNavigate()

  return (
    <div className="w-full  bg-black px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center gap-6 text-sm">
        {tabs.map((tab) => {
          const isActive = active === tab;

          return (
            <button
              key={tab}
              onClick={() =>{
                 setActive(tab)
                 navigate(`/${tab}`)
                }}
              className={`px-3 py-1.5 rounded-md transition
                ${
                  isActive
                    ? "bg-gray-800 text-white"
                    : "text-gray-400 hover:text-white"
                }
              `}
            >
              {tab.toUpperCase()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
