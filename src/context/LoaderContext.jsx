import { createContext, useContext, useEffect, useState } from "react";
import {
  hideLoader,
  registerLoader,
  showLoader,
} from "../services/loaderService";
import { getProfileByRole } from "../services/profile.service";

const LoaderContext = createContext();

export const LoaderProvider = ({ children }) => {
  const [loadingCount, setLoadingCount] = useState(0);

  // ✅ React-connected functions
  const show = () => {
    setLoadingCount((prev) => prev + 1);
  };

  const hide = () => {
    setLoadingCount((prev) => Math.max(prev - 1, 0));
  };
  const [profile, setProfile] = useState(null);
  const loadProfile = async () => {
    // if (profile) return; // 🔥 already loaded
    try {
      const data = await getProfileByRole();
      // console.log("data" ,data);
      
      setProfile(data);
    } catch (e) {
      console.error(e);
    }
  };
  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    // ✅ register React functions
    registerLoader(show, hide);
  }, []);

  return (
    <LoaderContext.Provider
      value={{
        loading: loadingCount > 0,
        showLoader: show,
        hideLoader: hide,
        loadProfile: loadProfile,
        profile: profile,
      }}
    >
      {children}
    </LoaderContext.Provider>
  );
};

export const useLoader = () => useContext(LoaderContext);
