import { createContext, useContext, useEffect, useState } from "react";
import { hideLoader, registerLoader, showLoader } from "../services/loaderService";

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
      }}
    >
      {children}
    </LoaderContext.Provider>
  );
};

export const useLoader = () => useContext(LoaderContext);
