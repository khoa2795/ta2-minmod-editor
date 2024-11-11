import { ReactElement, useEffect } from "react";
import { initNonCriticalStores } from "models";

export const InitNonCriticalStores = ({ children }: { children: ReactElement }) => {
  useEffect(() => {
    initNonCriticalStores();
  }, []);

  return children;
};
