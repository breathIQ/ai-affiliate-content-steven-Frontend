import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getBalance } from "../../services/billing.api";

export default function TopNavTabs() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : {};
  const [balance, setBalance] = useState(null);

  const defaultTabs = [
    { name: "Dashboard", path: "/admin/dashboard" },
    { name: "Users", path: "/admin/users" },
    { name: "Files", path: "/admin/files" },
  ];

  const userTabs = [
    { name: "Dashboard", path: "/u/dashboard" },
    { name: "Library", path: "/u/library" },
    { name: "Avatars", path: "/u/avatars" },
    { name: "Billing", path: "/u/billing" },
    // { name: "Schedule", path: "/u/schedule" },
  ];

  const [tabs, setTabs] = useState(defaultTabs);
  const [active, setActive] = useState(null);

  /* Sync tabs + active state with URL */
  useEffect(() => {
    // const isUserRoute = location.pathname.startsWith("/u/");
    if (user?.role_id) {
      const currentTabs = user?.role_id == 2 ? userTabs : defaultTabs;
      setTabs(currentTabs);
      const currentActive = currentTabs.find(
        (tab) => tab.path === location.pathname
      );

      setActive(currentActive || null);
    }
  }, [user?.role_id]);

  /* Load credit balance for regular users (same audience that sees userTabs) */
  useEffect(() => {
    if (user?.role_id != 2) return;

    getBalance()
      .then((res) => {
        if (res?.success) setBalance(res.data.credits_balance);
      })
      .catch((err) => console.error("GET BALANCE ERROR", err));
  }, [user?.role_id, location.pathname]);

  return (
    <div className="w-full bg-black px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center gap-3 sm:gap-6 text-sm">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = active?.path === tab.path;

            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`shrink-0 whitespace-nowrap px-[12px] py-[8px] rounded-md transition
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
        {user?.role_id == 1 && (
          <div className="ml-auto shrink-0">
            <span className="text-gray-400 text-[15px] whitespace-nowrap" style={{fontWeight:"600",color:"white"}}>Admin</span>
          </div>
        )}
        {user?.role_id == 2 && (
          <button
            onClick={() => navigate("/u/billing")}
            className="ml-auto shrink-0 flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-[12px] py-[6px] rounded-md transition"
          >
            <span className="text-gray-400 text-xs hidden sm:inline">Balance</span>
            <span className="text-white text-xs sm:text-sm font-semibold whitespace-nowrap">
              {balance === null ? "…" : `${balance} credits`}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
