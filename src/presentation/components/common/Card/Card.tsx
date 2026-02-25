import React from "react";

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  variant?: "default" | "elevated" | "outlined" | "glass";
  hover?: boolean;
  rounded?: "2xl" | "3xl";
}

export function Card({
  children,
  className = "",
  padding = "md",
  variant = "default",
  hover = false,
  rounded = "3xl",
}: CardProps) {
  const baseClasses = `bg-white border transition-all duration-300 ${
    rounded === "3xl" ? "rounded-[2.5rem]" : "rounded-2xl"
  }`;

  const variantClasses = {
    default: "border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]",
    elevated: "border-transparent shadow-2xl",
    outlined: "border-slate-200 shadow-none",
    glass:
      "bg-white/80 backdrop-blur-md border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.06)]",
  };

  const paddingClasses = {
    none: "p-0",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  const hoverClasses = hover
    ? "hover:scale-[1.01] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] cursor-pointer"
    : "";

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${hoverClasses} ${className}`}
    >
      {children}
    </div>
  );
}
