import React from "react";

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  variant?: "default" | "elevated" | "outlined";
}

export function Card({
  children,
  className = "",
  padding = "md",
  variant = "default",
}: CardProps) {
  const baseClasses = "bg-white rounded-[2.5rem] border transition-all";

  const variantClasses = {
    default: "border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]",
    elevated: "border-slate-100 shadow-xl",
    outlined: "border-slate-200 shadow-none",
  };

  const paddingClasses = {
    none: "p-0",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}
    >
      {children}
    </div>
  );
}
