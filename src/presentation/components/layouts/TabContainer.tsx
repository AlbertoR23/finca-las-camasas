import React from "react";

interface TabContainerProps {
  activeTab: string;
  children: React.ReactNode;
  className?: string;
}

export function TabContainer({
  activeTab,
  children,
  className = "",
}: TabContainerProps) {
  return (
    <div
      className={`space-y-6 animate-in slide-in-from-right-4 duration-500 ${className}`}
    >
      {children}
    </div>
  );
}

interface TabPanelProps {
  id: string;
  activeTab: string;
  children: React.ReactNode;
}

export function TabPanel({ id, activeTab, children }: TabPanelProps) {
  if (activeTab !== id) return null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {children}
    </div>
  );
}
