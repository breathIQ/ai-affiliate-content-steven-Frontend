import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function TopNavTabs() {
  const location = useLocation();
  const navigate = useNavigate();

  const defaultTabs =[
    { name: "Dashboard", path: "/u/dashboard" },
    { name: "Users", path: "/u/users" },
    { name: "Files", path: "/u/files" },
  ];

  const userTabs =  [
    { name: "Dashboard", path: "/u/dashboard" },
    { name: "Library", path: "/u/library" },
    { name: "Schedule", path: "/u/schedule" },
  ];

  const [tabs, setTabs] = useState(defaultTabs);
  const [active, setActive] = useState(null);

  /* Sync tabs + active state with URL */
  useEffect(() => {
    const isUserRoute = location.pathname.startsWith("/u/");

    const currentTabs = isUserRoute ? userTabs : defaultTabs;
    setTabs(currentTabs);

    const currentActive = currentTabs.find(
      (tab) => tab.path === location.pathname
    );

    setActive(currentActive || null);
  }, [location.pathname]);

  return (
    <div className="w-full bg-black px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center gap-6 text-sm">
        {tabs.map((tab) => {
          const isActive = active?.path === tab.path;

          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`px-[12px] py-[8px] rounded-md transition
                ${
                  isActive
                    ? "bg-gray-800 text-white"
                    : "text-gray-400 hover:text-white"
                }
              `}
            >
              {tab.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
