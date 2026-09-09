"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface UIContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  isMobile: boolean;
}

const UIContext = createContext<UIContextType>({
  sidebarOpen: false,
  toggleSidebar: () => {},
  closeSidebar: () => {},
  isMobile: false,
});

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false); // always visible on desktop
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <UIContext.Provider value={{ sidebarOpen, toggleSidebar, closeSidebar, isMobile }}>
      {children}
    </UIContext.Provider>
  );
}

export const useUI = () => useContext(UIContext);
